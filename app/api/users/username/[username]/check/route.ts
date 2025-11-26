import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const session = await getSession();
    const supabase = createAdminClient();

    // Validar formato do username
    if (!username || username.trim().length < 3) {
      return NextResponse.json({
        available: false,
        message: "Username deve ter pelo menos 3 caracteres",
      });
    }

    // Verificar se o username já existe
    const { data: existingUser, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", username.trim().toLowerCase())
      .single();

    // Se o usuário atual está usando o mesmo username, está disponível
    if (session && existingUser?.id === session.userId) {
      return NextResponse.json({
        available: true,
        message: "Este é seu username atual",
      });
    }

    // Se não encontrou usuário, está disponível
    if (error || !existingUser) {
      return NextResponse.json({
        available: true,
        message: "Username disponível",
      });
    }

    // Username já está em uso
    return NextResponse.json({
      available: false,
      message: "Username já está em uso",
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json(
      { error: "Erro ao verificar disponibilidade" },
      { status: 500 }
    );
  }
}
