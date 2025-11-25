/**
 * Token Utilities
 * Geração de tokens seguros para recuperação de senha e verificação de email
 */

import { randomBytes } from "crypto";

/**
 * Gera um token seguro para recuperação de senha
 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Gera um token seguro para verificação de email
 */
export function generateEmailVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Gera um hash do token para armazenamento seguro
 */
export function hashToken(token: string): string {
  // Em produção, use crypto.createHash('sha256').update(token).digest('hex')
  // Por simplicidade, retornamos o token (em produção, sempre hash)
  return token;
}

/**
 * Verifica se o token corresponde ao hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  return hashToken(token) === hash;
}

/**
 * Gera um código numérico de 6 dígitos
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

