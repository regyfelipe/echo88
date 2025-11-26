import { NextRequest, NextResponse } from "next/server";
import {
  uploadFile,
  validateFileType,
  type BucketType,
} from "@/lib/storage/upload";
import { getUserById } from "@/lib/db/users-supabase";

/**
 * POST /api/storage/upload-signup
 * Faz upload de arquivo durante signup (antes de autenticação)
 * Aceita userId e valida se o usuário existe e foi criado recentemente
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as BucketType;
    const userId = formData.get("userId") as string;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    // Valida se o usuário existe e foi criado recentemente (últimos 5 minutos)
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o usuário foi criado recentemente (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (user.createdAt < fiveMinutesAgo) {
      return NextResponse.json(
        {
          error: "Tempo de upload expirado. Faça login e atualize seu avatar.",
        },
        { status: 403 }
      );
    }

    if (
      !bucket ||
      !["avatars", "posts", "documents", "files"].includes(bucket)
    ) {
      return NextResponse.json({ error: "Bucket inválido" }, { status: 400 });
    }

    // Valida tipo e tamanho do arquivo
    const validation = validateFileType(bucket, file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Faz upload
    const result = await uploadFile({
      bucket,
      file,
      userId,
      folder: folder || undefined,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Upload signup error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro ao fazer upload",
      },
      { status: 500 }
    );
  }
}
