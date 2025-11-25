import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, setPasswordResetToken } from "@/lib/db/users-supabase";
import { generatePasswordResetToken } from "@/lib/auth/tokens";
import { sendPasswordResetEmail } from "@/lib/auth/email";

/**
 * POST /api/auth/forgot-password
 * Envia email de recuperação de senha
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      );
    }

    // Busca usuário
    const user = await getUserByEmail(email);

    // Sempre retorna sucesso para não expor se o email existe
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Se o email existir, você receberá instruções de recuperação",
      });
    }

    // Gera token de recuperação
    const resetToken = generatePasswordResetToken();

    // Salva token no banco
    await setPasswordResetToken(user.id, resetToken);

    // Envia email
    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      success: true,
      message: "Se o email existir, você receberá instruções de recuperação",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}

