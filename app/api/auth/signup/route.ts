import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  getUserByEmail,
  getUserByUsername,
} from "@/lib/db/users-supabase";
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
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
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

    // Valida username (letras, números, underscore e ponto)
    // Regras: 3-30 caracteres, pode conter pontos, mas não pode começar/terminar com ponto
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username deve ter entre 3 e 30 caracteres" },
        { status: 400 }
      );
    }

    // Não pode começar ou terminar com ponto
    if (username.startsWith(".") || username.endsWith(".")) {
      return NextResponse.json(
        { error: "Username não pode começar ou terminar com ponto" },
        { status: 400 }
      );
    }

    // Não pode ter pontos consecutivos
    if (username.includes("..")) {
      return NextResponse.json(
        { error: "Username não pode ter pontos consecutivos" },
        { status: 400 }
      );
    }

    // Permite letras, números, underscore e ponto
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username inválido. Use apenas letras, números, underscore e ponto",
        },
        { status: 400 }
      );
    }

    // Cria usuário
    const user = await createUser(email, username, fullName, password, avatar);

    // Envia email de verificação (não bloqueia o signup se falhar)
    // Gera token para envio (formato: verify_userId_timestamp)
    const verificationToken = `verify_${user.id}_${Date.now()}`;
    let emailSent = false;
    try {
      await sendVerificationEmail(user.email, verificationToken);
      emailSent = true;
    } catch (emailError) {
      // Loga o erro mas não falha o signup
      const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
      console.error("Error sending verification email:", emailError);
      // Se for erro de validação do Resend (test mode), loga informação útil
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

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Usuário criado com sucesso. Verifique seu email."
        : "Usuário criado com sucesso. O email de verificação não pôde ser enviado automaticamente.",
      emailSent,
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
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
