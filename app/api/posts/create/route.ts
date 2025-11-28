import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadFile, validateFileType } from "@/lib/storage/upload";
import { withSecurity } from "@/lib/security/request-wrapper";
import { createPostSchema, z } from "@/lib/validation/schemas";
import { validate } from "@/lib/validation/schemas";

/**
 * POST /api/posts/create
 * Cria um novo post
 */
async function createPostHandler(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const content = formData.get("content") as string | null;
    const type = formData.get("type") as string;
    const mediaFile = formData.get("media") as File | null;
    const galleryFiles = formData.getAll("gallery") as File[];
    const documentFile = formData.get("document") as File | null;
    const mediaTitle = formData.get("mediaTitle") as string | null;
    const mediaArtist = formData.get("mediaArtist") as string | null;
    const documentName = formData.get("documentName") as string | null;

    // Validação com Zod
    try {
      validate(createPostSchema, {
        content: content || undefined,
        type,
        mediaTitle: mediaTitle || undefined,
        mediaArtist: mediaArtist || undefined,
        documentName: documentName || undefined,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validação falhou",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // Validação de conteúdo
    const hasContent = content?.trim();
    const hasMedia = mediaFile && type !== "gallery" && type !== "document";
    const hasGallery = galleryFiles.length > 0 && type === "gallery";
    const hasDocument = documentFile && type === "document";

    if (!hasContent && !hasMedia && !hasGallery && !hasDocument) {
      return NextResponse.json(
        { error: "Post deve ter conteúdo, mídia ou documento" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    let mediaUrl: string | null = null;
    let mediaThumbnail: string | null = null;
    let documentUrl: string | null = null;
    const galleryItems: Array<{
      type: string;
      url: string;
      thumbnail?: string;
    }> = [];

    // Upload de mídia única (imagem, vídeo, áudio)
    if (mediaFile && type !== "gallery" && type !== "document") {
      const bucket = type === "image" || type === "video" ? "posts" : "files";
      const validation = validateFileType(bucket, mediaFile);

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const uploadResult = await uploadFile({
        bucket,
        file: mediaFile,
        userId: session.userId,
        // Sem subpasta, seguindo estrutura: {userId}/{timestamp}_{random}.{ext}
      });

      mediaUrl = uploadResult.publicUrl;

      // Para vídeos, podemos gerar thumbnail depois
      if (type === "video") {
        mediaThumbnail = null; // TODO: Gerar thumbnail do vídeo
      }
    }

    // Upload de documentos
    if (documentFile && type === "document") {
      const validation = validateFileType("documents", documentFile);

      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const uploadResult = await uploadFile({
        bucket: "documents",
        file: documentFile,
        userId: session.userId,
        // Sem subpasta, seguindo estrutura: {userId}/{timestamp}_{random}.{ext}
      });

      documentUrl = uploadResult.publicUrl;
    }

    // Upload de galeria (múltiplos arquivos)
    if (galleryFiles.length > 0 && type === "gallery") {
      for (const file of galleryFiles) {
        const bucket = file.type.startsWith("video/") ? "posts" : "posts";
        const validation = validateFileType(bucket, file);

        if (!validation.valid) {
          continue; // Pula arquivos inválidos
        }

        try {
          const uploadResult = await uploadFile({
            bucket,
            file,
            userId: session.userId,
            // Sem subpasta, seguindo estrutura: {userId}/{timestamp}_{random}.{ext}
          });

          galleryItems.push({
            type: file.type.startsWith("video/") ? "video" : "image",
            url: uploadResult.publicUrl,
          });
        } catch (error) {
          console.error(`Erro ao fazer upload de arquivo da galeria:`, error);
          // Continua com os outros arquivos
        }
      }

      if (galleryItems.length === 0) {
        return NextResponse.json(
          { error: "Nenhum arquivo válido foi enviado" },
          { status: 400 }
        );
      }
    }

    // Cria o post no banco
    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        user_id: session.userId,
        content: content?.trim() || null,
        type,
        media_url: mediaUrl,
        media_thumbnail: mediaThumbnail,
        media_title: mediaTitle || null,
        media_artist: mediaArtist || null,
        gallery_items: galleryItems.length > 0 ? galleryItems : null,
        document_url: documentUrl,
        document_name:
          documentName || (documentFile ? documentFile.name : null),
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      return NextResponse.json(
        { error: "Erro ao criar post" },
        { status: 500 }
      );
    }

    // Processar hashtags e menções (assíncrono, não bloqueia a resposta)
    if (content) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/api/posts/process-hashtags-mentions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: post.id,
            content,
            userId: session.userId,
          }),
        }
      ).catch((err) => {
        console.error("Error processing hashtags/mentions:", err);
      });
    }

    return NextResponse.json({
      success: true,
      post: {
        id: post.id,
        content: post.content,
        type: post.type,
        mediaUrl: post.media_url,
        mediaThumbnail: post.media_thumbnail,
        mediaTitle: post.media_title,
        mediaArtist: post.media_artist,
        galleryItems: post.gallery_items,
        documentUrl: post.document_url,
        documentName: post.document_name,
        createdAt: post.created_at,
      },
    });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao criar post",
      },
      { status: 500 }
    );
  }
}

// Export com segurança
export const POST = withSecurity(createPostHandler);
