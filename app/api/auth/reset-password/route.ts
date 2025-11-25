import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordResetToken, updateUserPassword } from "@/lib/db/users-supabase";
import { validatePasswordStrength } from "@/lib/auth/password";
import { hashToken } from "@/lib/auth/tokens";

/**
 * POST /api/auth/reset-password
 * Redefine a senha usando o token de recuperação
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token e nova senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica token
    const user = await verifyPasswordResetToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Token inválido ou expirado" },
        { status: 400 }
      );
    }

    // Valida força da senha
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Senha fraca", errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Atualiza senha
    await updateUserPassword(user.id, newPassword);

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Erro ao redefinir senha" },
      { status: 500 }
    );
  }
}

