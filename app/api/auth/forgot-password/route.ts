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

    // Envia email (não bloqueia se falhar)
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      // Loga o erro mas não falha a requisição (por segurança, sempre retorna sucesso)
      const errorMessage =
        emailError instanceof Error ? emailError.message : "Unknown error";
      console.error("Error sending password reset email:", errorMessage);
      interface ErrorWithStatusCode {
        statusCode?: number;
      }
      if ((emailError as ErrorWithStatusCode)?.statusCode === 403) {
        console.warn(
          "Resend test mode: Only emails to your verified test address can be sent. " +
            "To send to other addresses, verify a domain at resend.com/domains"
        );
      }
    }

    // Sempre retorna sucesso para não expor se o email existe
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
