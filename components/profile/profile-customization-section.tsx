"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Upload, Palette, Type, Layout, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileCustomizationSectionProps {
  coverImage: string | null;
  themeColor: string | null;
  accentColor: string | null;
  customFont: string | null;
  layoutStyle: string;
  customEmoji: string | null;
  onCoverImageChange: (file: File | null, preview: string) => void;
  onThemeColorChange: (color: string | null) => void;
  onAccentColorChange: (color: string | null) => void;
  onCustomFontChange: (font: string | null) => void;
  onLayoutStyleChange: (style: string) => void;
  onCustomEmojiChange: (emoji: string | null) => void;
}

const AVAILABLE_FONTS = [
  { value: null, label: "Padrão do Sistema" },
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "poppins", label: "Poppins" },
  { value: "montserrat", label: "Montserrat" },
  { value: "open-sans", label: "Open Sans" },
  { value: "lato", label: "Lato" },
  { value: "raleway", label: "Raleway" },
];

const LAYOUT_STYLES = [
  { value: "default", label: "Padrão", description: "Layout tradicional" },
  {
    value: "compact",
    label: "Compacto",
    description: "Mais conteúdo, menos espaço",
  },
  {
    value: "spacious",
    label: "Espaçoso",
    description: "Mais respiração visual",
  },
  { value: "minimal", label: "Minimalista", description: "Foco no essencial" },
];

const PRESET_COLORS = [
  { name: "Azul", value: "#3b82f6" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Laranja", value: "#f97316" },
  { name: "Amarelo", value: "#eab308" },
  { name: "Verde", value: "#22c55e" },
  { name: "Ciano", value: "#06b6d4" },
];

export function ProfileCustomizationSection({
  coverImage,
  themeColor,
  accentColor,
  customFont,
  layoutStyle,
  customEmoji,
  onCoverImageChange,
  onThemeColorChange,
  onAccentColorChange,
  onCustomFontChange,
  onLayoutStyleChange,
  onCustomEmojiChange,
}: ProfileCustomizationSectionProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string>(coverImage || "");

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        setCoverPreview(preview);
        onCoverImageChange(file, preview);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCover = () => {
    setCoverPreview("");
    onCoverImageChange(null, "");
    if (coverInputRef.current) {
      coverInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Capa de Perfil */}
      <Field>
        <FieldLabel className="flex items-center gap-2">
          <Upload className="size-4" />
          Capa de Perfil
        </FieldLabel>
        <div className="space-y-3">
          {coverPreview ? (
            <div className="relative group">
              <div className="relative h-32 rounded-lg overflow-hidden bg-muted">
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    <Upload className="size-4 mr-2" />
                    Alterar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeCover}
                  >
                    <X className="size-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="h-32 rounded-lg border-2 border-dashed border-input flex items-center justify-center bg-muted/30">
                <div className="text-center">
                  <Upload className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Adicione uma capa ao seu perfil
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                  >
                    Escolher Imagem
                  </Button>
                </div>
              </div>
            </div>
          )}
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="hidden"
          />
          <FieldDescription className="text-xs">
            Recomendado: 1500x500px, máximo 5MB
          </FieldDescription>
        </div>
      </Field>

      {/* Cores Personalizadas */}
      <div className="space-y-4">
        <FieldLabel className="flex items-center gap-2">
          <Palette className="size-4" />
          Cores Personalizadas
        </FieldLabel>

        {/* Cor do Tema */}
        <Field>
          <FieldLabel htmlFor="themeColor" className="text-sm">
            Cor Principal
          </FieldLabel>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                id="themeColor"
                type="color"
                value={themeColor || "#3b82f6"}
                onChange={(e) => onThemeColorChange(e.target.value)}
                className="h-10 w-20 cursor-pointer"
              />
              <Input
                type="text"
                placeholder="#3b82f6"
                value={themeColor || ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  onThemeColorChange(value || null);
                }}
                className="flex-1"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onThemeColorChange(color.value)}
                  className={cn(
                    "size-8 rounded-full border-2 transition-all hover:scale-110",
                    themeColor === color.value
                      ? "border-foreground ring-2 ring-offset-2"
                      : "border-border"
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              {themeColor && (
                <button
                  type="button"
                  onClick={() => onThemeColorChange(null)}
                  className="size-8 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center hover:border-foreground"
                  title="Remover cor"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </Field>

        {/* Cor de Destaque */}
        <Field>
          <FieldLabel htmlFor="accentColor" className="text-sm">
            Cor de Destaque
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="accentColor"
              type="color"
              value={accentColor || "#8b5cf6"}
              onChange={(e) => onAccentColorChange(e.target.value)}
              className="h-10 w-20 cursor-pointer"
            />
            <Input
              type="text"
              placeholder="#8b5cf6"
              value={accentColor || ""}
              onChange={(e) => {
                const value = e.target.value.trim();
                onAccentColorChange(value || null);
              }}
              className="flex-1"
              pattern="^#[0-9A-Fa-f]{6}$"
            />
            {accentColor && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onAccentColorChange(null)}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </Field>
      </div>

      {/* Fonte Personalizada */}
      <Field>
        <FieldLabel className="flex items-center gap-2">
          <Type className="size-4" />
          Fonte Personalizada
        </FieldLabel>
        <select
          value={customFont || ""}
          onChange={(e) => onCustomFontChange(e.target.value || null)}
          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          {AVAILABLE_FONTS.map((font) => (
            <option key={font.value || "default"} value={font.value || ""}>
              {font.label}
            </option>
          ))}
        </select>
        <FieldDescription className="text-xs">
          Escolha uma fonte para personalizar seu perfil
        </FieldDescription>
      </Field>

      {/* Estilo de Layout */}
      <Field>
        <FieldLabel className="flex items-center gap-2">
          <Layout className="size-4" />
          Estilo de Layout
        </FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          {LAYOUT_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onLayoutStyleChange(style.value)}
              className={cn(
                "p-4 rounded-lg border-2 text-left transition-all",
                layoutStyle === style.value
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="font-semibold text-sm mb-1">{style.label}</div>
              <div className="text-xs text-muted-foreground">
                {style.description}
              </div>
            </button>
          ))}
        </div>
      </Field>

      {/* Emoji Personalizado */}
      <Field>
        <FieldLabel className="flex items-center gap-2">
          <Sparkles className="size-4" />
          Emoji Personalizado
        </FieldLabel>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="😊"
            value={customEmoji || ""}
            onChange={(e) => {
              const value = e.target.value.trim();
              // Limitar a um único emoji
              const emoji = value.length > 0 ? value[0] : null;
              onCustomEmojiChange(emoji);
            }}
            maxLength={2}
            className="text-2xl text-center"
          />
          <FieldDescription className="text-xs">
            Escolha um emoji para representar você (máximo 1 emoji)
          </FieldDescription>
          {customEmoji && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onCustomEmojiChange(null)}
              className="w-full"
            >
              <X className="size-4 mr-2" />
              Remover Emoji
            </Button>
          )}
        </div>
      </Field>
    </div>
  );
}
