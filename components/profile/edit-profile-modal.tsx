"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  UploadIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { User, Upload } from "lucide-react";
import { ProfileCustomizationSection } from "./profile-customization-section";

interface AvailabilityStatus {
  available: boolean | null;
  message?: string;
  checking: boolean;
}

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  onSuccess,
}: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [themeColor, setThemeColor] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [customFont, setCustomFont] = useState<string | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<string>("default");
  const [customEmoji, setCustomEmoji] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>({
    available: null,
    checking: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do perfil quando o modal abrir
  useEffect(() => {
    if (isOpen && user) {
      // Buscar dados completos do perfil
      fetch("/api/users/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setUsername(data.username);
            setFullName(data.fullName || "");
            setBio(data.bio || "");
            setAvatarPreview(data.avatar || "");
            setCoverPreview(data.coverImage || "");
            setThemeColor(data.themeColor || null);
            setAccentColor(data.accentColor || null);
            setCustomFont(data.customFont || null);
            setLayoutStyle(data.layoutStyle || "default");
            setCustomEmoji(data.customEmoji || null);
          } else {
            // Fallback para dados do contexto
            setUsername(user.username);
            setFullName(user.fullName);
            setBio("");
            setAvatarPreview(user.avatar || "");
            setCoverPreview("");
            setThemeColor(null);
            setAccentColor(null);
            setCustomFont(null);
            setLayoutStyle("default");
            setCustomEmoji(null);
          }
        })
        .catch((err) => {
          console.error("Error loading profile:", err);
          // Fallback para dados do contexto
          setUsername(user.username);
          setFullName(user.fullName);
          setBio("");
          setAvatarPreview(user.avatar || "");
          setCoverPreview("");
          setThemeColor(null);
          setAccentColor(null);
          setCustomFont(null);
          setLayoutStyle("default");
          setCustomEmoji(null);
        });
    }
  }, [isOpen, user]);

  // Limpar estados quando fechar
  useEffect(() => {
    if (!isOpen) {
      setAvatar(null);
      setCoverImage(null);
      setError(null);
      setShowCustomization(false);
      setUsernameStatus({ available: null, checking: false });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  // Verificar disponibilidade do username
  const checkAvailability = useCallback(
    async (value: string) => {
      if (!value || value.trim().length < 3) {
        setUsernameStatus({ available: null, checking: false });
        return;
      }

      // Se o username não mudou, não precisa verificar
      if (value === user?.username) {
        setUsernameStatus({ available: true, checking: false });
        return;
      }

      setUsernameStatus({ available: null, checking: true });

      try {
        const response = await fetch(
          `/api/users/username/${encodeURIComponent(
            value.trim().toLowerCase()
          )}/check`
        );
        const data = await response.json();

        if (data.error) {
          setUsernameStatus({ available: null, checking: false });
          return;
        }

        if (data.available) {
          setUsernameStatus({
            available: true,
            message: data.message,
            checking: false,
          });
        } else {
          setUsernameStatus({
            available: false,
            message: data.message,
            checking: false,
          });
        }
      } catch (error) {
        console.error("Error checking availability:", error);
        setUsernameStatus({ available: null, checking: false });
      }
    },
    [user?.username]
  );

  // Debounce para username
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      if (username.trim().length >= 3) {
        checkAvailability(username);
      } else {
        setUsernameStatus({ available: null, checking: false });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, isOpen, checkAvailability]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione uma imagem");
        return;
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB");
        return;
      }

      setAvatar(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || username.trim().length < 3) {
      setError("Username deve ter pelo menos 3 caracteres");
      return;
    }

    if (!fullName.trim()) {
      setError("Nome completo é obrigatório");
      return;
    }

    if (usernameStatus.checking) {
      setError("Aguarde a verificação do username");
      return;
    }

    if (usernameStatus.available === false) {
      setError("Username não disponível");
      return;
    }

    setIsLoading(true);

    try {
      let avatarUrl = avatarPreview;
      let coverImageUrl = coverPreview;

      // Se houver novo avatar, fazer upload
      if (avatar) {
        const formData = new FormData();
        formData.append("file", avatar);
        formData.append("bucket", "avatars");

        const uploadResponse = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          throw new Error(uploadData.error || "Erro ao fazer upload do avatar");
        }

        const uploadData = await uploadResponse.json();
        avatarUrl = uploadData.publicUrl;
      }

      // Se houver nova capa, fazer upload
      if (coverImage) {
        const formData = new FormData();
        formData.append("file", coverImage);
        formData.append("bucket", "posts");
        formData.append("folder", "covers");

        const uploadResponse = await fetch("/api/storage/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          throw new Error(uploadData.error || "Erro ao fazer upload da capa");
        }

        const uploadData = await uploadResponse.json();
        coverImageUrl = uploadData.publicUrl;
      }

      // Atualizar perfil
      const updateResponse = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          fullName: fullName.trim(),
          bio: bio.trim() || null,
          avatarUrl: avatarUrl || null,
          coverImageUrl: coverImageUrl || null,
          themeColor: themeColor || null,
          accentColor: accentColor || null,
          customFont: customFont || null,
          layoutStyle: layoutStyle,
          customEmoji: customEmoji || null,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || "Erro ao atualizar perfil");
      }

      // Atualizar contexto do usuário
      await refreshUser();

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess();
      }

      // Fechar modal
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300 p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md max-h-[90vh] bg-background overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300 rounded-lg border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background">
          <h2 className="text-xl font-semibold">Editar Perfil</h2>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={onClose}
          >
            <HugeiconsIcon icon={CancelCircleIcon} className="size-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <FieldGroup>
            {/* Avatar */}
            <Field>
              <FieldLabel>Avatar</FieldLabel>
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="size-24 rounded-full object-cover border-2 border-input"
                    />
                  ) : (
                    <div className="size-24 rounded-full border-2 border-dashed border-input flex items-center justify-center">
                      <User className="size-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="size-4" />
                  {avatarPreview ? "Alterar Avatar" : "Escolher Avatar"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
            </Field>

            {/* Username */}
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className={cn(
                  usernameStatus.checking && "border-muted-foreground/50",
                  usernameStatus.available === true &&
                    "border-2 border-green-500 focus-visible:ring-green-500",
                  usernameStatus.available === false &&
                    "border-2 border-red-500 focus-visible:ring-red-500"
                )}
                disabled={isLoading}
              />
              {usernameStatus.checking && (
                <FieldDescription className="text-xs">
                  Verificando disponibilidade...
                </FieldDescription>
              )}
              {usernameStatus.available === true && (
                <FieldDescription className="text-xs text-green-600">
                  ✓ {usernameStatus.message || "Username disponível"}
                </FieldDescription>
              )}
              {usernameStatus.available === false && (
                <FieldDescription className="text-xs text-red-600">
                  ✗ {usernameStatus.message || "Username não disponível"}
                </FieldDescription>
              )}
            </Field>

            {/* Full Name */}
            <Field>
              <FieldLabel htmlFor="fullName">Nome Completo</FieldLabel>
              <Input
                id="fullName"
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>

            {/* Bio */}
            <Field>
              <FieldLabel htmlFor="bio">Bio</FieldLabel>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre você... Você pode usar links e emojis! 😊"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={2200}
                disabled={isLoading}
              />
              <FieldDescription className="text-xs text-right">
                {bio.length}/2200
              </FieldDescription>
              <FieldDescription className="text-xs text-muted-foreground mt-1">
                Dica: Links serão clicáveis automaticamente. Ex:
                https://exemplo.com
              </FieldDescription>
            </Field>

            {/* Botão para Personalização Visual */}
            <div className="pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowCustomization(!showCustomization)}
              >
                {showCustomization ? "Ocultar" : "Mostrar"} Personalização
                Visual
              </Button>
            </div>

            {/* Seção de Personalização Visual */}
            {showCustomization && (
              <div className="pt-4 border-t border-border space-y-4">
                <ProfileCustomizationSection
                  coverImage={coverPreview}
                  themeColor={themeColor}
                  accentColor={accentColor}
                  customFont={customFont}
                  layoutStyle={layoutStyle}
                  customEmoji={customEmoji}
                  onCoverImageChange={(file, preview) => {
                    setCoverImage(file);
                    setCoverPreview(preview);
                  }}
                  onThemeColorChange={setThemeColor}
                  onAccentColorChange={setAccentColor}
                  onCustomFontChange={setCustomFont}
                  onLayoutStyleChange={setLayoutStyle}
                  onCustomEmojiChange={setCustomEmoji}
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  isLoading ||
                  usernameStatus.checking ||
                  usernameStatus.available === false ||
                  !username.trim() ||
                  !fullName.trim()
                }
              >
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}
