import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/db/users-supabase";
import { validatePasswordStrength } from "@/lib/auth/password";
import { sendVerificationEmail } from "@/lib/auth/email";
import { hashToken } from "@/lib/auth/tokens";

/**
 * POST /api/auth/signup
 * Cria um novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, fullName, password, avatar } = body;

    // Validação de campos
    if (!email || !username || !fullName || !password) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    // Valida formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Valida força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Senha fraca", errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Verifica se email já existe
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 }
      );
    }

    // Verifica se username já existe
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username já cadastrado" },
        { status: 409 }
      );
    }

    // Valida username (apenas letras, números e underscore)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username inválido. Use apenas letras, números e underscore" },
        { status: 400 }
      );
    }

    // Cria usuário
    const user = await createUser(email, username, fullName, password, avatar);

    // Envia email de verificação
    // Gera token para envio (formato: verify_userId_timestamp)
    const verificationToken = `verify_${user.id}_${Date.now()}`;
    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json({
      success: true,
      message: "Usuário criado com sucesso. Verifique seu email.",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erro ao criar conta" },
      { status: 500 }
    );
  }
}

