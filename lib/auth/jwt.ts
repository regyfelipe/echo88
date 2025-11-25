/**
 * JWT Utilities
 * Gerenciamento de tokens JWT com foco em performance e segurança
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

const ISSUER = "echo88";
const AUDIENCE = "echo88-users";

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  sessionId: string;
  deviceId?: string;
}

/**
 * Gera um token JWT
 */
export async function generateToken(
  payload: Omit<TokenPayload, "iat" | "exp" | "iss" | "aud">
): Promise<string> {
  const jwt = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
    sessionId: payload.sessionId,
    deviceId: payload.deviceId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("7d") // Token expira em 7 dias
    .sign(SECRET_KEY);

  return jwt;
}

/**
 * Verifica e decodifica um token JWT
 */
export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Gera um refresh token (mais longo)
 */
export async function generateRefreshToken(
  payload: Omit<TokenPayload, "iat" | "exp" | "iss" | "aud">
): Promise<string> {
  const jwt = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
    sessionId: payload.sessionId,
    deviceId: payload.deviceId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("30d") // Refresh token expira em 30 dias
    .sign(SECRET_KEY);

  return jwt;
}

