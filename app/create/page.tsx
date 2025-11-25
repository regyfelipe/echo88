"use client";

import { useState, useRef } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Image as ImageIcon,
  Video,
  Music,
  X,
  FileText,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

type MediaType = "text" | "image" | "video" | "audio" | "gallery" | null;

interface GalleryItem {
  url: string;
  type: "image" | "video";
  file?: File;
  thumbnail?: string;
}

export default function CreatePage() {
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<MediaType>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [audioTitle, setAudioTitle] = useState("");
  const [audioArtist, setAudioArtist] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (
    type: "image" | "video" | "audio",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaType(type);
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

  const removeGalleryItem = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
    if (gallery.length === 1) {
      setMediaType(null);
    }
  };

  const removeMedia = () => {
    setMediaType(null);
    setMediaPreview(null);
    setGallery([]);
    setAudioTitle("");
    setAudioArtist("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  };

  const handlePublish = () => {
    // Aqui você pode adicionar a lógica de publicação
    console.log({
      content,
      mediaType,
      mediaPreview,
      audioTitle,
      audioArtist,
    });
    // Redirecionar para o feed após publicar
    window.location.href = "/feed";
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold transition-all hover:scale-105">
            Criar Post
          </h1>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={
              !content.trim() &&
              !mediaType &&
              (!gallery || gallery.length === 0)
            }
            className="transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            Publicar
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-semibold">U</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Seu Nome</p>
                <p className="text-xs text-muted-foreground">@seuusuario</p>
              </div>
            </div>

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
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 size-7 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg backdrop-blur-sm bg-destructive/90"
                        onClick={() => removeGalleryItem(index)}
                      >
                        <X className="size-4" />
                      </Button>
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
                    <audio src={mediaPreview} controls className="w-full h-8" />
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
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
