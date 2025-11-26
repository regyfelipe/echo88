/**
 * Image Compression Utilities
 * Compressão automática de imagens no cliente
 */

import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * Comprime uma imagem automaticamente
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxSizeMB = 1, // 1MB por padrão
    maxWidthOrHeight = 1920, // Máximo de 1920px
    useWebWorker = true,
    fileType,
  } = options;

  try {
    // Verifica se é uma imagem
    if (!file.type.startsWith("image/")) {
      return file; // Retorna o arquivo original se não for imagem
    }

    // Opções de compressão
    const compressionOptions = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType: fileType || file.type,
      initialQuality: 0.8,
    };

    // Comprime a imagem
    const compressedFile = await imageCompression(file, compressionOptions);

    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    // Em caso de erro, retorna o arquivo original
    return file;
  }
}

/**
 * Comprime múltiplas imagens
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  const compressedFiles: File[] = [];

  for (const file of files) {
    if (file.type.startsWith("image/")) {
      const compressed = await compressImage(file, options);
      compressedFiles.push(compressed);
    } else {
      compressedFiles.push(file); // Mantém arquivos não-imagem como estão
    }
  }

  return compressedFiles;
}

/**
 * Redimensiona uma imagem para dimensões específicas
 */
export async function resizeImage(
  file: File,
  width: number,
  height: number,
  quality: number = 0.8
): Promise<File> {
  try {
    if (!file.type.startsWith("image/")) {
      return file;
    }

    const options = {
      maxWidthOrHeight: Math.max(width, height),
      useWebWorker: true,
      initialQuality: quality,
    };

    const resized = await imageCompression(file, options);
    return resized;
  } catch (error) {
    console.error("Error resizing image:", error);
    return file;
  }
}

