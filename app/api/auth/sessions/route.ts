import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getUserSessions } from "@/lib/db/users-supabase";

/**
 * GET /api/auth/sessions
 * Obtém histórico de sessões de login do usuário
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    // Obtém todas as sessões do usuário
    const sessions = await getUserSessions(session.userId);

    // Formata sessões para resposta
    const formattedSessions = sessions
      .filter((s) => s.isActive)
      .map((s) => ({
        id: s.id,
        deviceId: s.deviceId,
        device: s.deviceInfo.device,
        browser: s.deviceInfo.browser,
        location: s.deviceInfo.location,
        ip: s.deviceInfo.ip,
        createdAt: s.createdAt.toISOString(),
        lastActiveAt: s.lastActiveAt.toISOString(),
        isCurrent: s.id === session.sessionId,
      }))
      .sort((a, b) => {
        // Ordena por última atividade (mais recente primeiro)
        return (
          new Date(b.lastActiveAt).getTime() -
          new Date(a.lastActiveAt).getTime()
        );
      });

    return NextResponse.json({
      success: true,
      sessions: formattedSessions,
      total: formattedSessions.length,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Erro ao obter sessões" },
      { status: 500 }
    );
  }
}

