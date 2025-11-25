/**
 * User Database (Supabase)
 * Implementação usando Supabase como banco de dados
 */

import { createServerClient } from "../supabase/server";
import { hashPassword, verifyPassword } from "../auth/password";
import { hashToken } from "../auth/tokens";
import type { Database } from "../supabase/database.types";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserInsert = Database["public"]["Tables"]["users"]["Insert"];
type UserUpdate = Database["public"]["Tables"]["users"]["Update"];
type SessionRow = Database["public"]["Tables"]["login_sessions"]["Row"];
type SessionInsert = Database["public"]["Tables"]["login_sessions"]["Insert"];

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo: {
    device: string;
    browser: string;
    location?: string;
    ip: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
}

/**
 * Converte UserRow do Supabase para User
 */
function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    fullName: row.full_name,
    passwordHash: row.password_hash,
    emailVerified: row.email_verified,
    emailVerificationToken: row.email_verification_token || undefined,
    emailVerificationExpires: row.email_verification_expires
      ? new Date(row.email_verification_expires)
      : undefined,
    passwordResetToken: row.password_reset_token || undefined,
    passwordResetExpires: row.password_reset_expires
      ? new Date(row.password_reset_expires)
      : undefined,
    avatar: row.avatar_url || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Converte SessionRow do Supabase para LoginSession
 */
function rowToSession(row: SessionRow): LoginSession {
  const deviceInfo = row.device_info as LoginSession["deviceInfo"];
  return {
    id: row.id,
    userId: row.user_id,
    deviceId: row.device_id,
    deviceInfo,
    createdAt: new Date(row.created_at),
    lastActiveAt: new Date(row.last_active_at),
    isActive: row.is_active,
  };
}

/**
 * Cria um novo usuário
 */
export async function createUser(
  email: string,
  username: string,
  fullName: string,
  password: string,
  avatar?: string
): Promise<User> {
  const supabase = await createServerClient();
  const passwordHash = await hashPassword(password);
  const emailVerificationToken = hashToken(
    `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const emailVerificationExpires = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

  const insert: UserInsert = {
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    full_name: fullName,
    password_hash: passwordHash,
    email_verified: false,
    email_verification_token: emailVerificationToken,
    email_verification_expires: emailVerificationExpires,
    avatar_url: avatar || null,
  };

  const { data, error } = await supabase
    .from("users")
    .insert(insert)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique constraint violation
      if (error.message.includes("email")) {
        throw new Error("Email já cadastrado");
      }
      if (error.message.includes("username")) {
        throw new Error("Username já cadastrado");
      }
    }
    throw error;
  }

  return rowToUser(data);
}

/**
 * Busca usuário por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return rowToUser(data);
}

/**
 * Busca usuário por username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (error || !data) {
    return null;
  }

  return rowToUser(data);
}

/**
 * Busca usuário por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return rowToUser(data);
}

/**
 * Verifica credenciais de login
 */
export async function verifyCredentials(
  emailOrUsername: string,
  password: string
): Promise<User | null> {
  const user =
    (await getUserByEmail(emailOrUsername)) ||
    (await getUserByUsername(emailOrUsername));

  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  return isValid ? user : null;
}

/**
 * Atualiza token de recuperação de senha
 */
export async function setPasswordResetToken(
  userId: string,
  token: string
): Promise<void> {
  const supabase = await createServerClient();
  const hashedToken = hashToken(token);
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1h

  const { error } = await supabase
    .from("users")
    .update({
      password_reset_token: hashedToken,
      password_reset_expires: expires,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Verifica token de recuperação de senha
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<User | null> {
  const supabase = await createServerClient();
  const hashedToken = hashToken(token);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("password_reset_token", hashedToken)
    .gt("password_reset_expires", new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return rowToUser(data);
}

/**
 * Atualiza senha do usuário
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const supabase = await createServerClient();
  const passwordHash = await hashPassword(newPassword);

  const { error } = await supabase
    .from("users")
    .update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Verifica token de verificação de email
 */
export async function verifyEmailToken(token: string): Promise<User | null> {
  // Token vem no formato: verify_userId_timestamp
  const parts = token.split("_");
  if (parts.length < 3 || parts[0] !== "verify") {
    return null;
  }

  const userId = parts.slice(1, -1).join("_");
  const user = await getUserById(userId);

  if (!user || !user.emailVerificationToken) {
    return null;
  }

  // Verifica se o token não expirou
  if (
    user.emailVerificationExpires &&
    user.emailVerificationExpires < new Date()
  ) {
    return null;
  }

  return user;
}

/**
 * Marca email como verificado
 */
export async function verifyUserEmail(userId: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("users")
    .update({
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Adiciona sessão de login
 */
export async function addLoginSession(
  userId: string,
  deviceId: string,
  deviceInfo: LoginSession["deviceInfo"]
): Promise<LoginSession> {
  const supabase = await createServerClient();

  const insert: SessionInsert = {
    user_id: userId,
    device_id: deviceId,
    device_info: deviceInfo,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("login_sessions")
    .insert(insert)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return rowToSession(data);
}

/**
 * Obtém todas as sessões de um usuário
 */
export async function getUserSessions(userId: string): Promise<LoginSession[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("login_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("last_active_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(rowToSession);
}

/**
 * Remove uma sessão específica
 */
export async function removeSession(
  userId: string,
  sessionId: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("login_sessions")
    .update({ is_active: false })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Remove todas as sessões de um usuário (exceto a atual)
 */
export async function removeAllSessionsExcept(
  userId: string,
  currentSessionId: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("login_sessions")
    .update({ is_active: false })
    .eq("user_id", userId)
    .neq("id", currentSessionId);

  if (error) {
    throw error;
  }
}

/**
 * Atualiza última atividade de uma sessão
 */
export async function updateSessionActivity(
  userId: string,
  sessionId: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("login_sessions")
    .update({ last_active_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

