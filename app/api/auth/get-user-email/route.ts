import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db/users-supabase";

/**
 * GET /api/auth/get-user-email?userId=xxx
 * Obtém o email do usuário pelo ID (para verificação)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      emailVerified: user.emailVerified,
    });
  } catch (error) {
    console.error("Get user email error:", error);
    return NextResponse.json(
      { error: "Erro ao obter email do usuário" },
      { status: 500 }
    );
  }
}

