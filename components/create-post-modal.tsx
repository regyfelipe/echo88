"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  VoiceIcon,
  Video01Icon,
  AttachmentIcon,
  MoreVerticalIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handlePublish = () => {
    if (!content.trim()) return;
    // Aqui você pode adicionar a lógica de publicação
    console.log({ content });
    setContent("");
    onClose();
    // Redirecionar para o feed após publicar
    window.location.href = "/feed";
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
            <span className="text-primary font-bold text-base sm:text-lg">
              U
            </span>
          </div>

          {/* Name and Username */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">Seu Nome</p>
            <p className="text-xs text-muted-foreground truncate">
              @seuusuario
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
            placeholder="Tell others about yourself..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[100px] sm:min-h-[120px] resize-none border-0 bg-transparent text-sm sm:text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            rows={4}
          />
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-border shrink-0">
          {/* Left Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <HugeiconsIcon icon={VoiceIcon} className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <HugeiconsIcon icon={Video01Icon} className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <HugeiconsIcon icon={AttachmentIcon} className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-10 sm:size-11 text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <HugeiconsIcon icon={MoreVerticalIcon} className="size-5" />
            </Button>
          </div>

          {/* Publish Button */}
          <Button
            onClick={handlePublish}
            disabled={!content.trim()}
            className={cn(
              "px-4 sm:px-6 py-2 text-sm sm:text-base font-medium bg-foreground text-background hover:bg-foreground/90 transition-all duration-300 touch-manipulation",
              !content.trim() && "opacity-50 cursor-not-allowed"
            )}
          >
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
