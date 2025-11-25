import { NextRequest, NextResponse } from "next/server";
import { getSession, deleteSession } from "@/lib/auth/session";
import { removeAllSessionsExcept } from "@/lib/db/users-supabase";

/**
 * POST /api/auth/logout-all
 * Faz logout de todos os dispositivos (exceto o atual)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Remove todas as sessões exceto a atual
    await removeAllSessionsExcept(session.userId, session.sessionId);

    return NextResponse.json({
      success: true,
      message: "Logout realizado em todos os dispositivos",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer logout" },
      { status: 500 }
    );
  }
}

