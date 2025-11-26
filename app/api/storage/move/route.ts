import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BucketType } from "@/lib/storage/upload";

/**
 * POST /api/storage/move
 * Move um arquivo de uma pasta para outra (útil após criar usuário)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bucket, fromPath, toPath } = body;

    if (!bucket || !fromPath || !toPath) {
      return NextResponse.json(
        { error: "bucket, fromPath e toPath são obrigatórios" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Faz download do arquivo original
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket as BucketType)
      .download(fromPath);

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: "Erro ao baixar arquivo original" },
        { status: 404 }
      );
    }

    // Faz upload para o novo caminho
    const { error: uploadError } = await supabase.storage
      .from(bucket as BucketType)
      .upload(toPath, fileData, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "Erro ao mover arquivo" },
        { status: 500 }
      );
    }

    // Remove arquivo original
    await supabase.storage.from(bucket as BucketType).remove([fromPath]);

    // Obtém URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket as BucketType).getPublicUrl(toPath);

    return NextResponse.json({
      success: true,
      path: toPath,
      publicUrl,
    });
  } catch (error) {
    console.error("Move file error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao mover arquivo" },
      { status: 500 }
    );
  }
}

