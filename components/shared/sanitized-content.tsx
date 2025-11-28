/**
 * SanitizedContent Component
 * 
 * Componente para renderizar conteúdo sanitizado do usuário
 */

"use client";

import { useMemo, type ElementType } from "react";
import {
  sanitizeHtml,
  sanitizeText,
  sanitizeBio,
  sanitizePostContent,
} from "@/lib/utils/sanitize";

interface SanitizedContentProps {
  content: string | null | undefined;
  type?: "text" | "html" | "bio" | "post";
  className?: string;
  maxLength?: number;
  showMore?: boolean;
  as?: ElementType;
}

/**
 * Componente para renderizar conteúdo sanitizado
 */
export function SanitizedContent({
  content,
  type = "text",
  className,
  maxLength,
  showMore = false,
  as: Component = "div",
}: SanitizedContentProps) {
  const sanitized = useMemo(() => {
    if (!content) return "";

    let sanitizedContent: string;

    switch (type) {
      case "bio":
        sanitizedContent = sanitizeBio(content);
        break;
      case "post":
        sanitizedContent = sanitizePostContent(content);
        break;
      case "html":
        sanitizedContent = sanitizeHtml(content);
        break;
      case "text":
      default:
        sanitizedContent = sanitizeText(content);
        break;
    }

    if (maxLength && sanitizedContent.length > maxLength) {
      if (showMore) {
        // Retornar conteúdo truncado com "ver mais"
        return sanitizedContent.substring(0, maxLength);
      }
      return sanitizedContent.substring(0, maxLength) + "...";
    }

    return sanitizedContent;
  }, [content, type, maxLength, showMore]);

  if (!sanitized) {
    return null;
  }

  // Para HTML, usar dangerouslySetInnerHTML (já sanitizado)
  if (type === "html" || type === "bio" || type === "post") {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }

  // Para texto simples, renderizar normalmente
  return <Component className={className}>{sanitized}</Component>;
}

/**
 * Hook para sanitizar conteúdo
 */
export function useSanitizedContent(
  content: string | null | undefined,
  type: "text" | "html" | "bio" | "post" = "text"
): string {
  return useMemo(() => {
    if (!content) return "";

    switch (type) {
      case "bio":
        return sanitizeBio(content);
      case "post":
        return sanitizePostContent(content);
      case "html":
        return sanitizeHtml(content);
      case "text":
      default:
        return sanitizeText(content);
    }
  }, [content, type]);
}

