import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken, verifyUserEmail } from "@/lib/db/users-supabase";

/**
 * POST /api/auth/verify-email
 * Verifica o email do usuário usando o token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica token
    const user = await verifyEmailToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Verifica se já foi verificado
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email já verificado",
        alreadyVerified: true,
      });
    }

    // Marca email como verificado
    await verifyUserEmail(user.id);

    return NextResponse.json({
      success: true,
      message: "Email verificado com sucesso",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar email" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/verify-email?token=xxx
 * Verifica o email via query parameter (para links em emails)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica token
    const user = await verifyEmailToken(token);

    if (!user) {
      return NextResponse.redirect(
        new URL("/verify-email?error=invalid_token", request.url)
      );
    }

    // Verifica se já foi verificado
    if (user.emailVerified) {
      return NextResponse.redirect(
        new URL("/verify-email?success=already_verified", request.url)
      );
    }

    // Marca email como verificado
    await verifyUserEmail(user.id);

    return NextResponse.redirect(
      new URL("/verify-email?success=true", request.url)
    );
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(
      new URL("/verify-email?error=server_error", request.url)
    );
  }
}

