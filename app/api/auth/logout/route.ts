import { NextRequest, NextResponse } from "next/server";
import { getSession, deleteSession } from "@/lib/auth/session";
import { removeSession } from "@/lib/db/users-supabase";

/**
 * POST /api/auth/logout
 * Faz logout do usuário (remove sessão atual)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (session) {
      // Remove sessão do banco de dados
      await removeSession(session.userId, session.sessionId);
    }

    // Remove cookies
    await deleteSession();

    return NextResponse.json({ success: true, message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer logout" },
      { status: 500 }
    );
  }
}

