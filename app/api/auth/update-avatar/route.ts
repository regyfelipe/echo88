import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/auth/update-avatar
 * Atualiza o avatar do usuário autenticado
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

    const body = await request.json();
    const { avatarUrl } = body;

    if (!avatarUrl) {
      return NextResponse.json(
        { error: "avatarUrl é obrigatório" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Atualiza avatar do usuário
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: avatarUrl })
      .eq("id", session.userId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Avatar atualizado com sucesso",
    });
  } catch (error) {
    console.error("Update avatar error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao atualizar avatar" },
      { status: 500 }
    );
  }
}

