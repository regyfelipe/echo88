import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { uploadFile, validateFileType, type BucketType } from "@/lib/storage/upload";

/**
 * POST /api/storage/upload
 * Faz upload de um arquivo para o Supabase Storage
 */
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Obtém dados do FormData
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as BucketType;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    if (!bucket || !["avatars", "posts", "documents", "files"].includes(bucket)) {
      return NextResponse.json(
        { error: "Bucket inválido" },
        { status: 400 }
      );
    }

    // Valida tipo e tamanho do arquivo
    const validation = validateFileType(bucket, file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Faz upload
    const result = await uploadFile({
      bucket,
      file,
      userId: session.userId,
      folder: folder || undefined,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao fazer upload" },
      { status: 500 }
    );
  }
}

