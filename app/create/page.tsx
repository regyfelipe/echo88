"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Image as ImageIcon,
  Video,
  Music,
  X,
  FileText,
  Edit2,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { compressImage, compressImages } from "@/lib/utils/image-compression";
import { ImageEditor } from "@/components/shared/image-editor";

type MediaType = "text" | "image" | "video" | "audio" | "gallery" | "document" | null;

interface GalleryItem {
  url: string;
  type: "image" | "video";
  file?: File;
  thumbnail?: string;
}

export default function CreatePage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [editingImage, setEditingImage] = useState<File | null>(null);
  const [editingImageType, setEditingImageType] = useState<"single" | "gallery" | null>(null);
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Redireciona se não estiver autenticado
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleMediaSelect = async (
    type: "image" | "video" | "audio",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é GIF
      if (file.type === "image/gif") {
        setMediaType(type);
        setMediaFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Comprimir imagens automaticamente (exceto GIFs)
      if (type === "image" && file.type.startsWith("image/")) {
        try {
          const compressed = await compressImage(file);
          setMediaType(type);
          setMediaFile(compressed);
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(reader.result as string);
          };
          reader.readAsDataURL(compressed);
        } catch (err) {
          console.error("Error compressing image:", err);
          // Fallback para arquivo original
          setMediaType(type);
          setMediaFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
            setMediaPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      } else {
        setMediaType(type);
        setMediaFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType("document");
      setDocumentFile(file);
      setDocumentName(file.name);
      setDocumentPreview(file.name);
    }
  };

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setMediaType("gallery");
      
      // Comprimir imagens automaticamente
      try {
        const compressedFiles = await compressImages(files);
        
        compressedFiles.forEach((file, index) => {
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
      } catch (err) {
        console.error("Error compressing images:", err);
        // Fallback para arquivos originais
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
    }
  };

  const handleEditImage = (type: "single" | "gallery", index?: number) => {
    if (type === "single" && mediaFile) {
      setEditingImage(mediaFile);
      setEditingImageType("single");
      setEditingImageIndex(null);
      setShowImageEditor(true);
    } else if (type === "gallery" && index !== undefined && gallery[index]?.file) {
      setEditingImage(gallery[index].file!);
      setEditingImageType("gallery");
      setEditingImageIndex(index);
      setShowImageEditor(true);
    }
  };

  const handleSaveEditedImage = (editedFile: File) => {
    if (editingImageType === "single") {
      setMediaFile(editedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(editedFile);
    } else if (editingImageType === "gallery" && editingImageIndex !== null) {
      setGallery((prev) => {
        const newGallery = [...prev];
        const reader = new FileReader();
        reader.onloadend = () => {
          newGallery[editingImageIndex] = {
            ...newGallery[editingImageIndex],
            url: reader.result as string,
            file: editedFile,
          };
          setGallery(newGallery);
        };
        reader.readAsDataURL(editedFile);
        return newGallery;
      });
    }
    setShowImageEditor(false);
    setEditingImage(null);
    setEditingImageType(null);
    setEditingImageIndex(null);
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
    setDocumentPreview(null);
    setDocumentName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  const handlePublish = async () => {
    if (!user) return;

    // Validação
    if (!content.trim() && !mediaFile && gallery.length === 0 && !documentFile) {
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

      // Upload com progress usando XMLHttpRequest
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.error) {
                throw new Error(data.error);
              }
              // Sucesso - redireciona para o feed
              router.push("/feed");
              router.refresh();
              resolve();
            } catch (err) {
              reject(err);
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText);
              reject(new Error(data.error || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        xhr.open("POST", "/api/posts/create");
        xhr.send(formData);
      });
    } catch (err) {
      console.error("Error publishing post:", err);
      setError(err instanceof Error ? err.message : "Erro ao publicar post");
    } finally {
      setIsPublishing(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-500 relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold transition-all hover:scale-105">
            Criar Post
          </h1>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={
              isPublishing ||
              (!content.trim() &&
                !mediaFile &&
                (!gallery || gallery.length === 0) &&
                !documentFile)
            }
            className="transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isPublishing ? "Publicando..." : "Publicar"}
          </Button>
        </div>
        {/* Progress Bar */}
        {isPublishing && uploadProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-primary font-semibold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{user.fullName}</p>
                <p className="text-xs text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Field>
              <FieldLabel htmlFor="content" className="sr-only">
                Conteúdo
              </FieldLabel>
              <textarea
                id="content"
                placeholder="O que você está pensando?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[150px] resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>

            {/* Gallery Preview */}
            {mediaType === "gallery" && gallery.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out mb-3 shadow-sm bg-muted/30">
                <div className="grid grid-cols-2 gap-3 p-3">
                  {gallery.map((item, index) => (
                    <div
                      key={index}
                      className="relative group animate-in fade-in zoom-in duration-500"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={`Imagem ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        {item.type === "image" && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-7 hover:scale-110 shadow-lg backdrop-blur-sm bg-background/90"
                            onClick={() => handleEditImage("gallery", index)}
                            title="Editar imagem"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="size-7 hover:scale-110 shadow-lg backdrop-blur-sm bg-destructive/90"
                          onClick={() => removeGalleryItem(index)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2.5 text-xs font-medium text-muted-foreground text-center bg-muted/50 border-t border-border/50">
                  {gallery.length} {gallery.length === 1 ? "item" : "itens"} na
                  galeria
                </div>
              </div>
            )}

            {/* Media Preview */}
            {mediaPreview && mediaType !== "gallery" && (
              <div className="relative rounded-2xl overflow-hidden border border-border animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out shadow-sm">
                {mediaType === "image" && (
                  <div className="relative">
                    <div className="aspect-video bg-muted">
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
                      />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-9 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in zoom-in shadow-lg backdrop-blur-sm bg-background/90"
                        onClick={() => handleEditImage("single")}
                        title="Editar imagem"
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="size-9 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in zoom-in shadow-lg backdrop-blur-sm bg-destructive/90"
                        onClick={removeMedia}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
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
                      className="absolute top-3 right-3 size-9 transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in zoom-in shadow-lg backdrop-blur-sm bg-destructive/90"
                      onClick={removeMedia}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
                {mediaType === "audio" && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="size-16 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <Music className="size-8 text-primary" />
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
                    <audio src={mediaPreview || undefined} controls className="w-full h-8" />
                  </div>
                )}
                {mediaType === "document" && documentPreview && (
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center gap-4">
                      <div className="size-16 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <FileText className="size-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{documentName || "Documento"}</p>
                        <p className="text-xs text-muted-foreground">
                          {documentFile ? `${(documentFile.size / 1024).toFixed(1)} KB` : ""}
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
            )}

            {/* Media Buttons */}
            {!mediaType && (
              <div className="flex items-center gap-2 flex-wrap animate-in fade-in duration-500">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105 active:scale-95 hover:bg-primary/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="size-4 transition-transform group-hover:scale-110" />
                  Foto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105 active:scale-95 hover:bg-primary/10"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="size-4 transition-transform group-hover:scale-110" />
                  Vídeo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105 active:scale-95 hover:bg-primary/10"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <Music className="size-4 transition-transform group-hover:scale-110" />
                  Música
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105 active:scale-95 hover:bg-primary/10"
                  onClick={() => galleryInputRef.current?.click()}
                >
                  <ImageIcon className="size-4 transition-transform group-hover:scale-110" />
                  Galeria
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 transition-all hover:scale-105 active:scale-95 hover:bg-primary/10"
                  onClick={() => documentInputRef.current?.click()}
                >
                  <FileText className="size-4 transition-transform group-hover:scale-110" />
                  Documento
                </Button>
              </div>
            )}

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
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Image Editor Modal */}
      {showImageEditor && editingImage && (
        <ImageEditor
          image={editingImage}
          onSave={handleSaveEditedImage}
          onCancel={() => {
            setShowImageEditor(false);
            setEditingImage(null);
            setEditingImageType(null);
            setEditingImageIndex(null);
          }}
        />
      )}
    </div>
  );
}

