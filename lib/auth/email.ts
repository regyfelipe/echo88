/**
 * Email Utilities
 * Envio de emails usando Resend
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";
const APP_NAME = process.env.APP_NAME || "Echo88";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Envia email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;

  try {
    // Se não tiver API key, apenas loga (modo desenvolvimento)
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] Password reset for ${email}`);
      console.log(`[EMAIL] Reset URL: ${resetUrl}`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Redefinir senha - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Redefinir Senha</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Redefinir sua senha</h2>
              <p>Você solicitou a redefinição de senha. Clique no botão abaixo para criar uma nova senha:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Redefinir Senha</a>
              </div>
              <p style="color: #666; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
              <p style="color: #667eea; word-break: break-all; font-size: 12px;">${resetUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Este link expira em 1 hora. Se você não solicitou esta redefinição, ignore este email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }

    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    // Em desenvolvimento, apenas loga
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] Password reset URL: ${resetUrl}`);
    } else {
      throw error;
    }
  }
}

/**
 * Envia email de verificação
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/verify-email?token=${verificationToken}`;

  try {
    // Se não tiver API key, apenas loga (modo desenvolvimento)
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] Verification email for ${email}`);
      console.log(`[EMAIL] Verification URL: ${verificationUrl}`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Verifique seu email - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificar Email</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Bem-vindo ao ${APP_NAME}!</h2>
              <p>Obrigado por se cadastrar. Para completar seu cadastro, verifique seu endereço de email clicando no botão abaixo:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Verificar Email</a>
              </div>
              <p style="color: #666; font-size: 14px;">Ou copie e cole este link no seu navegador:</p>
              <p style="color: #667eea; word-break: break-all; font-size: 12px;">${verificationUrl}</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Este link expira em 24 horas. Se você não criou uma conta, ignore este email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }

    console.log(`[EMAIL] Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Em desenvolvimento, apenas loga
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] Verification URL: ${verificationUrl}`);
    } else {
      throw error;
    }
  }
}

/**
 * Envia código de verificação por email
 */
export async function sendVerificationCode(
  email: string,
  code: string
): Promise<void> {
  try {
    // Se não tiver API key, apenas loga (modo desenvolvimento)
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] Verification code for ${email}: ${code}`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Código de verificação - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Código de Verificação</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Seu código de verificação</h2>
              <p>Use o código abaixo para verificar sua conta:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: #f5f5f5; border: 2px dashed #667eea; padding: 20px; border-radius: 8px; display: inline-block;">
                  <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${code}</span>
                </div>
              </div>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Este código expira em 10 minutos. Se você não solicitou este código, ignore este email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending verification code:", error);
      throw error;
    }

    console.log(`[EMAIL] Verification code sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification code:", error);
    // Em desenvolvimento, apenas loga
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] Verification code: ${code}`);
    } else {
      throw error;
    }
  }
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
  try {
    // Se não tiver API key, apenas loga (modo desenvolvimento)
    if (!process.env.RESEND_API_KEY) {
      console.log(`[EMAIL] New login notification for ${email}`);
      console.log(
        `[EMAIL] Device: ${deviceInfo.device}, Browser: ${deviceInfo.browser}, IP: ${deviceInfo.ip}`
      );
      return;
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Novo login detectado - ${APP_NAME}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Novo Login</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${APP_NAME}</h1>
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Novo login detectado</h2>
              <p>Uma nova sessão foi iniciada na sua conta:</p>
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Dispositivo:</strong> ${
                  deviceInfo.device
                }</p>
                <p style="margin: 5px 0;"><strong>Navegador:</strong> ${
                  deviceInfo.browser
                }</p>
                <p style="margin: 5px 0;"><strong>IP:</strong> ${
                  deviceInfo.ip
                }</p>
                ${
                  deviceInfo.location
                    ? `<p style="margin: 5px 0;"><strong>Localização:</strong> ${deviceInfo.location}</p>`
                    : ""
                }
              </div>
              <p style="color: #d32f2f; font-size: 14px; margin-top: 20px;">
                <strong>⚠️ Se você não reconhece este login, altere sua senha imediatamente.</strong>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                Se você fez este login, pode ignorar este email com segurança.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending login notification:", error);
      throw error;
    }

    console.log(`[EMAIL] Login notification sent to ${email}`);
  } catch (error) {
    console.error("Error sending login notification:", error);
    // Em desenvolvimento, apenas loga
    if (!process.env.RESEND_API_KEY) {
      console.log(
        `[EMAIL] Login notification: ${deviceInfo.device}, ${deviceInfo.browser}, ${deviceInfo.ip}`
      );
    } else {
      throw error;
    }
  }
}
