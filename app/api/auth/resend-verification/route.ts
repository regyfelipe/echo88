import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db/users-supabase";
import { sendVerificationEmail } from "@/lib/auth/email";
import { hashToken } from "@/lib/auth/tokens";

/**
 * POST /api/auth/resend-verification
 * Reenvia email de verificação
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

    if (!user) {
      // Não expõe se o email existe
      return NextResponse.json({
        success: true,
        message: "Se o email existir e não estiver verificado, você receberá um novo email",
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
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: "Email de verificação reenviado",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Erro ao reenviar email" },
      { status: 500 }
    );
  }
}

