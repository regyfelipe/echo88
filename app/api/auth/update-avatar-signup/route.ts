import { NextRequest, NextResponse } from "next/server";
import { getUserById } from "@/lib/db/users-supabase";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/update-avatar-signup
 * Atualiza o avatar durante signup (sem autenticação)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, avatarUrl } = body;

    if (!userId || !avatarUrl) {
      return NextResponse.json(
        { error: "userId e avatarUrl são obrigatórios" },
        { status: 400 }
      );
    }

    // Valida se o usuário existe e foi criado recentemente
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
        { error: "Tempo de atualização expirado" },
        { status: 403 }
      );
    }

    const supabase = createAdminClient();

    // Atualiza avatar do usuário
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Avatar atualizado com sucesso",
    });
  } catch (error) {
    console.error("Update avatar signup error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro ao atualizar avatar",
      },
      { status: 500 }
    );
  }
}
