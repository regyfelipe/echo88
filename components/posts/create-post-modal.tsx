"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  VoiceIcon,
  Video01Icon,
  AttachmentIcon,
  MoreVerticalIcon,
  Image01Icon,
} from "@hugeicons/core-free-icons";
import { X, Image as ImageIcon, Video, Music, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MediaType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "gallery"
  | "document"
  | null;

interface GalleryItem {
  url: string;
  type: "image" | "video";
  file?: File;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Limpa o estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setMediaType(null);
      setMediaPreview(null);
      setMediaFile(null);
      setGallery([]);
      setAudioTitle("");
      setAudioArtist("");
      setDocumentFile(null);
      setDocumentName("");
      setError(null);
      // Limpa inputs de arquivo
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Auto focus no textarea quando abrir
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const handleMediaSelect = (
    type: "image" | "video" | "audio",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType(type);
      setMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaType("gallery");
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newItem: GalleryItem = {
            url: reader.result as string,
            type: file.type.startsWith("video/") ? "video" : "image",
            file,
          };
          setGallery((prev) => [...prev, newItem]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType("document");
      setDocumentFile(file);
      setDocumentName(file.name);
    }
  };

  const removeGalleryItem = (index: number) => {
    setGallery((prev) => {
      const newGallery = prev.filter((_, i) => i !== index);
      if (newGallery.length === 0) {
        setMediaType(null);
      }
      return newGallery;
    });
  };

  const removeMedia = () => {
    setMediaType(null);
    setMediaPreview(null);
    setMediaFile(null);
    setGallery([]);
    setAudioTitle("");
    setAudioArtist("");
    setDocumentFile(null);
    setDocumentName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const handlePublish = async () => {
    if (!user) {
      setError("Você precisa estar logado para publicar");
      return;
    }

    // Validação
    if (
      !content.trim() &&
      !mediaFile &&
      gallery.length === 0 &&
      !documentFile
    ) {
      setError("Adicione conteúdo, mídia ou documento ao post");
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const formData = new FormData();

      // Adiciona conteúdo
      if (content.trim()) {
        formData.append("content", content.trim());
      }

      // Determina o tipo do post
      let postType: MediaType = mediaType;
      if (!postType && content.trim()) {
        postType = "text";
      }
      if (!postType) {
        setError("Selecione um tipo de mídia ou adicione texto");
        setIsPublishing(false);
        return;
      }
      formData.append("type", postType);

      // Adiciona mídia única
      if (mediaFile && postType !== "gallery" && postType !== "document") {
        formData.append("media", mediaFile);
        if (postType === "audio") {
          if (audioTitle) formData.append("mediaTitle", audioTitle);
          if (audioArtist) formData.append("mediaArtist", audioArtist);
        }
      }

      // Adiciona documentos
      if (documentFile && postType === "document") {
        formData.append("document", documentFile);
        if (documentName) formData.append("documentName", documentName);
      }

      // Adiciona galeria
      if (postType === "gallery" && gallery.length > 0) {
        gallery.forEach((item) => {
          if (item.file) {
            formData.append("gallery", item.file);
          }
        });
      }

      const response = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar post");
      }

      // Sucesso - fecha modal e recarrega
      onClose();
      router.refresh();
    } catch (err) {
      console.error("Error publishing post:", err);
      setError(err instanceof Error ? err.message : "Erro ao publicar post");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md bg-background rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-border shrink-0">
          {/* Avatar */}
          <div className="size-10 sm:size-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="size-full object-cover"
              />
            ) : (
              <span className="text-primary font-bold text-base sm:text-lg">
                {user?.fullName.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          {/* Name and Username */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {user?.fullName || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              @{user?.username || "usuario"}
            </p>
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 sm:size-10 shrink-0"
            onClick={onClose}
          >
            <HugeiconsIcon icon={CancelCircleIcon} className="size-5" />
          </Button>
        </div>

        {/* Content Input */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex-1 overflow-y-auto">
          <textarea
            ref={textareaRef}
            placeholder="O que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[100px] sm:min-h-[120px] resize-none border-0 bg-transparent text-sm sm:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            rows={4}
          />

          {/* Error Message */}
          {error && (
            <div className="mt-3 rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Gallery Preview */}
          {mediaType === "gallery" && gallery.length > 0 && (
            <div className="mt-4 rounded-xl overflow-hidden border border-border">
              <div className="grid grid-cols-2 gap-2 p-2">
                {gallery.map((item, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Imagem ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          controls
                        />
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryItem(index)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Preview */}
          {mediaPreview &&
            mediaType !== "gallery" &&
            mediaType !== "document" && (
              <div className="mt-4 relative rounded-xl overflow-hidden border border-border">
                {mediaType === "image" && (
                  <div className="relative">
                    <div className="aspect-video bg-muted">
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={removeMedia}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
                {mediaType === "video" && (
                  <div className="relative">
                    <div className="aspect-video bg-muted">
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={removeMedia}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
                {mediaType === "audio" && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Music className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Título da música"
                          value={audioTitle}
                          onChange={(e) => setAudioTitle(e.target.value)}
                          className="w-full bg-transparent border-b border-primary/30 px-2 py-1 text-sm font-semibold focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Artista"
                          value={audioArtist}
                          onChange={(e) => setAudioArtist(e.target.value)}
                          className="w-full bg-transparent border-b border-primary/30 px-2 py-1 text-xs text-muted-foreground mt-1 focus:outline-none focus:border-primary"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={removeMedia}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                    <audio
                      src={mediaPreview || undefined}
                      controls
                      className="w-full h-8"
                    />
                  </div>
                )}
              </div>
            )}

          {/* Document Preview */}
          {mediaType === "document" && documentFile && (
            <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                  <FileText className="size-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {documentName || "Documento"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {documentFile
                      ? `${(documentFile.size / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={removeMedia}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border shrink-0">
          {/* Left Icons */}
          {!mediaType && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => fileInputRef.current?.click()}
                title="Adicionar foto"
              >
                <ImageIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => videoInputRef.current?.click()}
                title="Adicionar vídeo"
              >
                <Video className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => audioInputRef.current?.click()}
                title="Adicionar áudio"
              >
                <Music className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => galleryInputRef.current?.click()}
                title="Adicionar galeria"
              >
                <ImageIcon className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
                onClick={() => documentInputRef.current?.click()}
                title="Adicionar documento"
              >
                <FileText className="size-5" />
              </Button>
            </div>
          )}

          {/* Publish Button */}
          <Button
            onClick={handlePublish}
            disabled={
              isPublishing ||
              (!content.trim() &&
                !mediaFile &&
                gallery.length === 0 &&
                !documentFile)
            }
            className={cn(
              "px-4 sm:px-6 py-2 text-sm sm:text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 touch-manipulation",
              (isPublishing ||
                (!content.trim() &&
                  !mediaFile &&
                  gallery.length === 0 &&
                  !documentFile)) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            {isPublishing ? "Publicando..." : "Publicar"}
          </Button>
        </div>

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleMediaSelect("image", e)}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(e) => handleMediaSelect("video", e)}
          className="hidden"
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => handleMediaSelect("audio", e)}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleGallerySelect}
          className="hidden"
        />
        <input
          ref={documentInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={handleDocumentSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
