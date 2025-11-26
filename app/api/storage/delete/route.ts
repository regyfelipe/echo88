import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { deleteFile, type BucketType } from "@/lib/storage/upload";

/**
 * DELETE /api/storage/delete
 * Remove um arquivo do Supabase Storage
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { bucket, filePath } = body;

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: "Bucket e filePath são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica se o arquivo pertence ao usuário
    if (!filePath.startsWith(session.userId)) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Remove arquivo
    await deleteFile(bucket as BucketType, filePath);

    return NextResponse.json({
      success: true,
      message: "Arquivo removido com sucesso",
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao deletar arquivo",
      },
      { status: 500 }
    );
  }
}
