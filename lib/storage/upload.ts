/**
 * Storage Utilities
 * Funções para upload e gerenciamento de arquivos no Supabase Storage
 */

import { createAdminClient } from "../supabase/admin";

export type BucketType = "avatars" | "posts" | "documents" | "files";

export interface UploadOptions {
  bucket: BucketType;
  file: File;
  userId: string;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  path: string;
  url: string;
  publicUrl: string;
}

/**
 * Faz upload de um arquivo para o Supabase Storage
 */
export async function uploadFile({
  bucket,
  file,
  userId,
  folder,
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  const supabase = createAdminClient();

  // Gera nome único para o arquivo
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}.${fileExt}`;
  const filePath = folder
    ? `${userId}/${folder}/${fileName}`
    : `${userId}/${fileName}`;

  // Faz upload do arquivo
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    // Se for erro de RLS e service role key não estiver configurado, fornece mensagem mais útil
    if (
      error.message.includes("row-level security") &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error(
        `Erro ao fazer upload: RLS policy violation. ` +
          `Configure SUPABASE_SERVICE_ROLE_KEY no arquivo .env ou execute a migration ` +
          `004_storage_service_role_policies.sql no Supabase SQL Editor. ` +
          `Erro original: ${error.message}`
      );
    }
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  // Obtém URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    path: filePath,
    url: data.path,
    publicUrl,
  };
}

/**
 * Faz upload de múltiplos arquivos
 */
export async function uploadFiles(
  files: File[],
  options: Omit<UploadOptions, "file">
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadFile({
      ...options,
      file,
      onProgress: (progress) => {
        // Calcula progresso total considerando todos os arquivos
        const totalProgress = ((i + progress / 100) / files.length) * 100;
        options.onProgress?.(totalProgress);
      },
    });
    results.push(result);
  }

  return results;
}

/**
 * Remove um arquivo do storage
 */
export async function deleteFile(
  bucket: BucketType,
  filePath: string
): Promise<void> {
  const supabase = createAdminClient();

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    throw new Error(`Erro ao deletar arquivo: ${error.message}`);
  }
}

/**
 * Obtém URL pública de um arquivo
 */
export function getPublicUrl(bucket: BucketType, filePath: string): string {
  const supabase = createAdminClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl;
}

/**
 * Obtém URL assinada (temporária) de um arquivo
 */
export async function getSignedUrl(
  bucket: BucketType,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Erro ao criar URL assinada: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Lista arquivos em um bucket
 */
export async function listFiles(
  bucket: BucketType,
  folder?: string,
  limit: number = 100
): Promise<Array<{ name: string; id: string; updated_at: string }>> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) {
    throw new Error(`Erro ao listar arquivos: ${error.message}`);
  }

  return data || [];
}

/**
 * Valida tipo de arquivo baseado no bucket
 */
export function validateFileType(
  bucket: BucketType,
  file: File
): { valid: boolean; error?: string } {
  const allowedTypes: Record<BucketType, string[]> = {
    avatars: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    posts: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif", // Suporte para GIFs animados
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ],
    documents: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    files: [], // Aceita qualquer tipo
  };

  const maxSizes: Record<BucketType, number> = {
    avatars: 5 * 1024 * 1024, // 5MB
    posts: 50 * 1024 * 1024, // 50MB
    documents: 10 * 1024 * 1024, // 10MB
    files: 100 * 1024 * 1024, // 100MB
  };

  const allowed = allowedTypes[bucket];
  const maxSize = maxSizes[bucket];

  // Verifica tamanho
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${(
        maxSize /
        1024 /
        1024
      ).toFixed(0)}MB`,
    };
  }

  // Verifica tipo (se houver restrições)
  if (allowed.length > 0 && !allowed.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos permitidos: ${allowed.join(
        ", "
      )}`,
    };
  }

  return { valid: true };
}
