/**
 * Email Utilities
 * Simulação de envio de emails (em produção, usar serviço real como SendGrid, Resend, etc)
 */

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  // Em produção, usar serviço de email real
  console.log(`[EMAIL] Password reset for ${email}`);
  console.log(`[EMAIL] Reset URL: ${resetUrl}`);

  // Simulação de envio
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia email de verificação
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

  // Em produção, usar serviço de email real
  console.log(`[EMAIL] Verification email for ${email}`);
  console.log(`[EMAIL] Verification URL: ${verificationUrl}`);

  // Simulação de envio
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia código de verificação por email
 */
export async function sendVerificationCode(
  email: string,
  code: string
): Promise<void> {
  // Em produção, usar serviço de email real
  console.log(`[EMAIL] Verification code for ${email}: ${code}`);

  // Simulação de envio
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Envia notificação de novo login
 */
export async function sendNewLoginNotification(
  email: string,
  deviceInfo: {
    device: string;
    browser: string;
    location?: string;
    ip: string;
  }
): Promise<void> {
  // Em produção, usar serviço de email real
  console.log(`[EMAIL] New login notification for ${email}`);
  console.log(`[EMAIL] Device: ${deviceInfo.device}, Browser: ${deviceInfo.browser}, IP: ${deviceInfo.ip}`);

  // Simulação de envio
  await new Promise((resolve) => setTimeout(resolve, 100));
}

