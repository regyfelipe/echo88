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
      // Remove sessão do banco de dados usando deviceId se disponível
      // O sessionId do token é um hash, mas precisamos usar deviceId para buscar a sessão
      const identifier = session.deviceId || session.sessionId;
      if (identifier) {
        try {
          await removeSession(session.userId, identifier);
        } catch (error) {
          // Se falhar, continua com o logout mesmo assim (remove cookies)
          console.error("Error removing session from database:", error);
        }
      }
    }

    // Remove cookies
    await deleteSession();

    return NextResponse.json({ success: true, message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Logout error:", error);
    // Mesmo com erro, tenta remover cookies
    try {
      await deleteSession();
    } catch {}
    return NextResponse.json(
      { error: "Erro ao fazer logout" },
      { status: 500 }
    );
  }
}

