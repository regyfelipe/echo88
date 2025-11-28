/**
 * Zod Schemas para Validação
 *
 * Schemas reutilizáveis para validação de inputs em APIs
 */

import { z } from "zod";

// Re-exportar z para uso em outros arquivos
export { z };

// ============================================
// Schemas de Autenticação
// ============================================

export const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email ou username é obrigatório")
    .max(255, "Email ou username muito longo"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
});

export const signupSchema = z.object({
  email: z.string().email("Email inválido").max(255, "Email muito longo"),
  username: z
    .string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(30, "Username muito longo")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username pode conter apenas letras, números e underscore"
    ),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
    ),
  fullName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo")
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
    ),
});

// ============================================
// Schemas de Posts
// ============================================

export const createPostSchema = z.object({
  content: z.string().max(5000, "Conteúdo muito longo").optional(),
  type: z.enum(["text", "image", "video", "audio", "gallery", "document"], {
    message: "Tipo de post inválido",
  }),
  mediaTitle: z.string().max(200, "Título muito longo").optional(),
  mediaArtist: z.string().max(100, "Artista muito longo").optional(),
  documentName: z.string().max(255, "Nome do documento muito longo").optional(),
});

export const updatePostSchema = z.object({
  content: z.string().max(5000, "Conteúdo muito longo").optional(),
  mediaTitle: z.string().max(200, "Título muito longo").optional(),
  mediaArtist: z.string().max(100, "Artista muito longo").optional(),
});

export const feedQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
  type: z
    .enum(["chronological", "relevance", "personalized"])
    .optional()
    .default("chronological"),
});

// ============================================
// Schemas de Usuário
// ============================================

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo")
    .optional(),
  username: z
    .string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(30, "Username muito longo")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username pode conter apenas letras, números e underscore"
    )
    .optional(),
  bio: z.string().max(500, "Bio muito longa").optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor de tema inválida (formato: #RRGGBB)")
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor de destaque inválida (formato: #RRGGBB)")
    .optional(),
  customFont: z.string().max(100, "Nome da fonte muito longo").optional(),
  layoutStyle: z.enum(["default", "compact", "spacious"]).optional(),
  customEmoji: z.string().max(10, "Emoji muito longo").optional(),
});

export const searchUsersSchema = z.object({
  q: z
    .string()
    .min(1, "Query de busca é obrigatória")
    .max(100, "Query muito longa"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(50)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

// ============================================
// Schemas de Comentários
// ============================================

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comentário não pode estar vazio")
    .max(1000, "Comentário muito longo"),
  postId: z.string().uuid("ID do post inválido"),
  parentId: z.string().uuid("ID do comentário pai inválido").optional(),
});

export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comentário não pode estar vazio")
    .max(1000, "Comentário muito longo"),
});

// ============================================
// Schemas de Follow
// ============================================

export const followUserSchema = z.object({
  userId: z.string().uuid("ID do usuário inválido"),
});

// ============================================
// Schemas de Stories
// ============================================

export const createStorySchema = z.object({
  type: z.enum(["image", "video"], {
    message: "Tipo de story inválido",
  }),
  expiresAt: z.string().datetime("Data de expiração inválida").optional(),
});

// ============================================
// Schemas de Busca
// ============================================

export const searchSchema = z.object({
  q: z
    .string()
    .min(1, "Query de busca é obrigatória")
    .max(200, "Query muito longa"),
  type: z.enum(["posts", "users", "hashtags", "all"]).optional().default("all"),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(50)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
});

// ============================================
// Schemas de Paginação
// ============================================

export const paginationSchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 0))
    .pipe(z.number().int().min(0)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
});

// ============================================
// Schemas de UUID
// ============================================

export const uuidSchema = z.string().uuid("ID inválido");

export const postIdSchema = uuidSchema;
export const userIdSchema = uuidSchema;
export const commentIdSchema = uuidSchema;
export const storyIdSchema = uuidSchema;

// ============================================
// Helper Functions
// ============================================

/**
 * Valida e retorna dados parseados ou lança erro formatado
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Valida e retorna dados parseados ou null se inválido
 */
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Formata erros do Zod para resposta de API
 */
export function formatZodError(error: z.ZodError): {
  error: string;
  details: Array<{ field: string; message: string }>;
} {
  return {
    error: "Validação falhou",
    details: error.issues.map((err) => ({
      field: err.path.join(".") || "root",
      message: err.message,
    })),
  };
}
