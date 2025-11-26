import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials, addLoginSession } from "@/lib/db/users-supabase";
import { createSession, setAuthCookie } from "@/lib/auth/session";
import { randomBytes } from "crypto";

/**
 * POST /api/auth/login
 * Autentica um usuário e cria uma sessão
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: "Email/username e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verifica credenciais
    const user = await verifyCredentials(emailOrUsername, password);

    if (!user) {
      return NextResponse.json(
        { error: "Credenciais inválidas" },
        { status: 401 }
      );
    }

    // Verifica se o email foi verificado
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Email não verificado",
          requiresVerification: true,
          userId: user.id,
        },
        { status: 403 }
      );
    }

    // Gera device ID
    const deviceId = randomBytes(16).toString("hex");

    // Obtém informações do dispositivo
    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "Unknown";

    // Cria sessão
    const { token, sessionId } = await createSession(
      user.id,
      user.email,
      user.username,
      deviceId
    );

    // Registra sessão de login
    await addLoginSession(user.id, deviceId, {
      device: userAgent,
      browser: userAgent,
      ip,
    });

    // Define cookie
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
      },
      sessionId,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 });
  }
}
