import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, getUserById } from "@/lib/db/users-supabase";
import { sendVerificationEmail } from "@/lib/auth/email";
import { hashToken } from "@/lib/auth/tokens";

/**
 * POST /api/auth/resend-verification
 * Reenvia email de verificação
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    let user;

    // Busca usuário por userId ou email
    if (userId) {
      user = await getUserById(userId);
    } else if (email) {
      user = await getUserByEmail(email);
    } else {
      return NextResponse.json(
        { error: "Email ou userId é obrigatório" },
        { status: 400 }
      );
    }

    if (!user) {
      // Não expõe se o email existe
      return NextResponse.json({
        success: true,
        message:
          "Se o email existir e não estiver verificado, você receberá um novo email",
      });
    }

    // Verifica se já está verificado
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email já verificado",
        alreadyVerified: true,
      });
    }

    // Gera novo token
    const verificationToken = `verify_${user.id}_${Date.now()}`;

    // Envia email
    try {
      await sendVerificationEmail(user.email, verificationToken);
      return NextResponse.json({
        success: true,
        message: "Email de verificação reenviado",
      });
    } catch (emailError) {
      const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
      console.error("Error sending verification email:", errorMessage);

      // Se for erro de validação do Resend (test mode), retorna mensagem mais específica
      interface ErrorWithStatusCode {
        statusCode?: number;
      }
      if ((emailError as ErrorWithStatusCode)?.statusCode === 403) {
        return NextResponse.json(
          {
            error:
              "Não foi possível enviar o email. Em modo de teste, apenas emails para o endereço verificado podem ser enviados. " +
              "Para enviar para outros endereços, verifique um domínio em resend.com/domains",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: "Erro ao reenviar email. Tente novamente mais tarde." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Erro ao reenviar email" },
      { status: 500 }
    );
  }
}
