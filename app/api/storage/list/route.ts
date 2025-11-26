import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listFiles, type BucketType } from "@/lib/storage/upload";

/**
 * GET /api/storage/list?bucket=xxx&folder=xxx
 * Lista arquivos em um bucket
 */
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticação
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get("bucket") as BucketType;
    const folder = searchParams.get("folder");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (
      !bucket ||
      !["avatars", "posts", "documents", "files"].includes(bucket)
    ) {
      return NextResponse.json({ error: "Bucket inválido" }, { status: 400 });
    }

    // Lista arquivos (apenas do usuário se não especificar folder)
    const userFolder = folder || session.userId;
    const files = await listFiles(bucket, userFolder, limit);

    return NextResponse.json({
      success: true,
      files,
      count: files.length,
    });
  } catch (error) {
    console.error("List files error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao listar arquivos",
      },
      { status: 500 }
    );
  }
}
