/**
 * Session Management
 * Gerenciamento de sessões de usuário
 */

import { cookies } from "next/headers";
import { generateToken, verifyToken, type TokenPayload } from "./jwt";
import { randomBytes } from "crypto";

export interface SessionData {
  userId: string;
  email: string;
  username: string;
  sessionId: string;
  deviceId?: string;
}

/**
 * Cria uma nova sessão
 */
export async function createSession(
  userId: string,
  email: string,
  username: string,
  deviceId?: string
): Promise<{ token: string; sessionId: string }> {
  const sessionId = randomBytes(32).toString("hex");
  const token = await generateToken({
    userId,
    email,
    username,
    sessionId,
    deviceId,
  });

  return { token, sessionId };
}

/**
 * Obtém a sessão atual do cookie
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
    };
  } catch {
    return null;
  }
}

/**
 * Remove a sessão (logout)
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  cookieStore.delete("refresh-token");
}

/**
 * Define o cookie de autenticação
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: "/",
  });
}

