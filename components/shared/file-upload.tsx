"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload01Icon,
  CancelCircleIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { BucketType } from "@/lib/storage/upload";

interface FileUploadProps {
  bucket: BucketType;
  folder?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  onUploadComplete?: (
    files: Array<{ path: string; url: string; publicUrl: string }>
  ) => void;
  onUploadError?: (error: string) => void;
  onProgress?: (progress: number) => void;
  className?: string;
  disabled?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  result?: { path: string; url: string; publicUrl: string };
  error?: string;
}

export function FileUpload({
  bucket,
  folder,
  accept,
  multiple = false,
  maxFiles = 1,
  onUploadComplete,
  onUploadError,
  onProgress,
  className,
  disabled = false,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const filesToUpload = multiple
        ? fileArray.slice(0, maxFiles)
        : [fileArray[0]];

      setIsUploading(true);

      // Inicializa estado de upload
      const initialFiles: UploadingFile[] = filesToUpload.map((file) => ({
        file,
        progress: 0,
        status: "uploading",
      }));
      setUploadingFiles(initialFiles);

      const results: Array<{ path: string; url: string; publicUrl: string }> =
        [];

      try {
        for (let i = 0; i < filesToUpload.length; i++) {
          const file = filesToUpload[i];
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket", bucket);
          if (folder) {
            formData.append("folder", folder);
          }

          const response = await fetch("/api/storage/upload", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Erro ao fazer upload");
          }

          // Atualiza progresso
          setUploadingFiles((prev) => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              progress: 100,
              status: "success",
              result: data,
            };
            return updated;
          });

          results.push(data);
          onProgress?.(((i + 1) / filesToUpload.length) * 100);
        }

        onUploadComplete?.(results);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao fazer upload";

        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "error",
            error: errorMessage,
          }))
        );

        onUploadError?.(errorMessage);
      } finally {
        setIsUploading(false);
      }
    },
    [
      bucket,
      folder,
      multiple,
      maxFiles,
      onUploadComplete,
      onUploadError,
      onProgress,
    ]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setUploadingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="gap-2"
        >
          <HugeiconsIcon icon={Upload01Icon} className="size-4" />
          {isUploading ? "Enviando..." : "Selecionar Arquivo"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {/* Lista de arquivos sendo enviados */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((uploadingFile, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                uploadingFile.status === "success" &&
                  "bg-green-50 border-green-200",
                uploadingFile.status === "error" && "bg-red-50 border-red-200",
                uploadingFile.status === "uploading" &&
                  "bg-blue-50 border-blue-200"
              )}
            >
              <HugeiconsIcon
                icon={Image01Icon}
                className={cn(
                  "size-5 shrink-0",
                  uploadingFile.status === "success" && "text-green-600",
                  uploadingFile.status === "error" && "text-red-600",
                  uploadingFile.status === "uploading" && "text-blue-600"
                )}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadingFile.file.name}
                </p>
                {uploadingFile.status === "uploading" && (
                  <div className="mt-1">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${uploadingFile.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadingFile.progress}%
                    </p>
                  </div>
                )}
                {uploadingFile.status === "success" && (
                  <p className="text-xs text-green-600 mt-1">
                    Upload concluído
                  </p>
                )}
                {uploadingFile.status === "error" && (
                  <p className="text-xs text-red-600 mt-1">
                    {uploadingFile.error || "Erro no upload"}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFile(index)}
                className="size-8 shrink-0"
              >
                <HugeiconsIcon icon={CancelCircleIcon} className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
