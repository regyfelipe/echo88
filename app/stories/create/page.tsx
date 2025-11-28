"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  Image01Icon,
  Video01Icon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/contexts/auth-context";
import { compressImage } from "@/lib/utils/image-compression";
import { ImageEditor } from "@/components/shared/image-editor";
import { useToast } from "@/contexts/toast-context";

export default function CreateStoryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { error: showError, warning } = useToast();
  const [media, setMedia] = useState<{
    file: File;
    url: string;
    type: "image" | "video";
  } | null>(null);
  const [content, setContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não renderizar nada se não estiver autenticado (redirecionamento em andamento)
  if (!user) {
    return null;
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      warning("Formato inválido", "Por favor, selecione uma imagem ou vídeo");
      return;
    }

    if (isImage) {
      try {
        const compressed = await compressImage(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1920,
        });
        const url = URL.createObjectURL(compressed);
        setMedia({
          file: compressed,
          url,
          type: "image",
        });
        setShowImageEditor(true);
      } catch (error) {
        console.error("Error compressing image:", error);
        const url = URL.createObjectURL(file);
        setMedia({
          file,
          url,
          type: "image",
        });
        setShowImageEditor(true);
      }
    } else {
      const url = URL.createObjectURL(file);
      setMedia({
        file,
        url,
        type: "video",
      });
    }
  };

  const handleImageEditComplete = (editedFile: File, editedUrl: string) => {
    setMedia({
      file: editedFile,
      url: editedUrl,
      type: "image",
    });
    setShowImageEditor(false);
  };

  const handleUpload = async () => {
    if (!media) return;

    setIsUploading(true);
    try {
      // Upload do arquivo
      const formData = new FormData();
      formData.append("file", media.file);
      formData.append("bucket", "posts"); // Usar bucket posts para stories
      formData.append("folder", "stories");

      const uploadResponse = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error("Upload error:", errorData);
        throw new Error(errorData.error || "Failed to upload media");
      }

      const uploadData = await uploadResponse.json();
      const mediaUrl = uploadData.url || uploadData.path;
      const thumbnail = uploadData.thumbnail;

      // Criar story
      const storyResponse = await fetch("/api/stories/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          media_url: mediaUrl,
          media_type: media.type,
          media_thumbnail: thumbnail,
          content: content || null,
        }),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json().catch(() => ({}));
        console.error("Story creation error:", errorData);
        throw new Error(errorData.error || "Failed to create story");
      }

      // Limpar URL do objeto antes de navegar
      if (media.url) {
        URL.revokeObjectURL(media.url);
      }

      router.push("/feed");
    } catch (error) {
      console.error("Error creating story:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao criar story. Tente novamente.";
      showError("Erro ao criar story", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    if (media?.url) {
      URL.revokeObjectURL(media.url);
    }
    setMedia(null);
    setContent("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (showImageEditor && media?.type === "image" && media.file) {
    return (
      <ImageEditor
        image={media.file}
        onSave={(editedFile) => {
          const editedUrl = URL.createObjectURL(editedFile);
          handleImageEditComplete(editedFile, editedUrl);
        }}
        onCancel={() => {
          setShowImageEditor(false);
          handleRemoveMedia();
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold">Criar Story</h1>
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={CancelCircleIcon} className="size-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {!media ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors"
                >
                  <HugeiconsIcon
                    icon={Image01Icon}
                    className="size-12 text-muted-foreground"
                  />
                  <span className="text-sm font-medium">Imagem</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors"
                >
                  <HugeiconsIcon
                    icon={Video01Icon}
                    className="size-12 text-muted-foreground"
                  />
                  <span className="text-sm font-medium">Vídeo</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted">
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt="Story preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <HugeiconsIcon icon={CancelCircleIcon} className="size-5" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Legenda (opcional)
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Adicione uma legenda à sua story..."
                  className="min-h-[100px]"
                  maxLength={2200}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {content.length}/2200
                </p>
              </div>

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? "Publicando..." : "Publicar Story"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Sua story será visível por 24 horas
              </p>
            </>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
