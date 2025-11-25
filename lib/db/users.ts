/**
 * User Database (Simulado)
 * Em produção, substituir por banco de dados real (PostgreSQL, MongoDB, etc)
 */

import { hashPassword, verifyPassword } from "../auth/password";
import { hashToken } from "../auth/tokens";

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

// Simulação de banco de dados em memória
const users: Map<string, User> = new Map();
const sessions: Map<string, LoginSession[]> = new Map();

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
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const passwordHash = await hashPassword(password);
  const emailVerificationToken = hashToken(
    `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const user: User = {
    id,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    fullName,
    passwordHash,
    emailVerified: false,
    emailVerificationToken,
    emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    avatar,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  users.set(id, user);
  sessions.set(id, []);

  return user;
}

/**
 * Busca usuário por email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  for (const user of users.values()) {
    if (user.email === email.toLowerCase()) {
      return user;
    }
  }
  return null;
}

/**
 * Busca usuário por username
 */
export async function getUserByUsername(
  username: string
): Promise<User | null> {
  for (const user of users.values()) {
    if (user.username === username.toLowerCase()) {
      return user;
    }
  }
  return null;
}

/**
 * Busca usuário por ID
 */
export async function getUserById(id: string): Promise<User | null> {
  return users.get(id) || null;
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
  const user = await getUserById(userId);
  if (!user) return;

  user.passwordResetToken = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  user.updatedAt = new Date();
  users.set(userId, user);
}

/**
 * Verifica token de recuperação de senha
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<User | null> {
  const hashedToken = hashToken(token);

  for (const user of users.values()) {
    if (
      user.passwordResetToken === hashedToken &&
      user.passwordResetExpires &&
      user.passwordResetExpires > new Date()
    ) {
      return user;
    }
  }

  return null;
}

/**
 * Atualiza senha do usuário
 */
export async function updateUserPassword(
  userId: string,
  newPassword: string
): Promise<void> {
  const user = await getUserById(userId);
  if (!user) return;

  user.passwordHash = await hashPassword(newPassword);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.updatedAt = new Date();
  users.set(userId, user);
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

  const userId = parts.slice(1, -1).join("_"); // Pega tudo exceto o último (timestamp)
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
  const user = await getUserById(userId);
  if (!user) return;

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  user.updatedAt = new Date();
  users.set(userId, user);
}

/**
 * Adiciona sessão de login
 */
export async function addLoginSession(
  userId: string,
  deviceId: string,
  deviceInfo: LoginSession["deviceInfo"]
): Promise<LoginSession> {
  const session: LoginSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    deviceId,
    deviceInfo,
    createdAt: new Date(),
    lastActiveAt: new Date(),
    isActive: true,
  };

  const userSessions = sessions.get(userId) || [];
  userSessions.push(session);
  sessions.set(userId, userSessions);

  return session;
}

/**
 * Obtém todas as sessões de um usuário
 */
export async function getUserSessions(userId: string): Promise<LoginSession[]> {
  return sessions.get(userId) || [];
}

/**
 * Remove uma sessão específica
 */
export async function removeSession(
  userId: string,
  sessionId: string
): Promise<void> {
  const userSessions = sessions.get(userId) || [];
  const index = userSessions.findIndex((s) => s.id === sessionId);
  if (index !== -1) {
    userSessions[index].isActive = false;
    sessions.set(userId, userSessions);
  }
}

/**
 * Remove todas as sessões de um usuário (exceto a atual)
 */
export async function removeAllSessionsExcept(
  userId: string,
  currentSessionId: string
): Promise<void> {
  const userSessions = sessions.get(userId) || [];
  userSessions.forEach((session) => {
    if (session.id !== currentSessionId) {
      session.isActive = false;
    }
  });
  sessions.set(userId, userSessions);
}

/**
 * Atualiza última atividade de uma sessão
 */
export async function updateSessionActivity(
  userId: string,
  sessionId: string
): Promise<void> {
  const userSessions = sessions.get(userId) || [];
  const session = userSessions.find((s) => s.id === sessionId);
  if (session) {
    session.lastActiveAt = new Date();
    sessions.set(userId, userSessions);
  }
}
