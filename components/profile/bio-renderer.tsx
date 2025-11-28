"use client";

import { useMemo } from "react";
import Link from "next/link";
import { sanitizeBio, sanitizeUrl } from "@/lib/utils/sanitize";

interface BioRendererProps {
  bio: string | null;
  className?: string;
}

// Função para detectar URLs e transformá-las em links
function parseBio(bio: string): Array<{ type: "text" | "link" | "emoji"; content: string; url?: string }> {
  if (!bio) return [];

  const parts: Array<{ type: "text" | "link" | "emoji"; content: string; url?: string }> = [];
  
  // Regex para URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Regex para emojis (Unicode ranges)
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  
  let lastIndex = 0;
  let match;

  // Processar URLs primeiro
  while ((match = urlRegex.exec(bio)) !== null) {
    // Adicionar texto antes da URL
    if (match.index > lastIndex) {
      const textBefore = bio.substring(lastIndex, match.index);
      // Processar emojis no texto antes
      parts.push(...parseEmojis(textBefore));
    }
    
    // Adicionar URL
    const url = match[0];
    parts.push({
      type: "link",
      content: url,
      url: url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`,
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Adicionar texto restante
  if (lastIndex < bio.length) {
    const remainingText = bio.substring(lastIndex);
    parts.push(...parseEmojis(remainingText));
  }
  
  return parts;
}

function parseEmojis(text: string): Array<{ type: "text" | "emoji"; content: string }> {
  const parts: Array<{ type: "text" | "emoji"; content: string }> = [];
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
  
  let lastIndex = 0;
  let match;
  
  while ((match = emojiRegex.exec(text)) !== null) {
    // Adicionar texto antes do emoji
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }
    
    // Adicionar emoji
    parts.push({
      type: "emoji",
      content: match[0],
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Adicionar texto restante
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }
  
  if (parts.length === 0) {
    parts.push({ type: "text", content: text });
  }
  
  return parts;
}

export function BioRenderer({ bio, className = "" }: BioRendererProps) {
  // Sanitizar bio antes de processar
  const sanitizedBio = useMemo(() => {
    if (!bio) return null;
    return sanitizeBio(bio);
  }, [bio]);

  const parsedBio = useMemo(() => {
    if (!sanitizedBio) return [];
    return parseBio(sanitizedBio);
  }, [sanitizedBio]);

  if (!sanitizedBio) return null;

  return (
    <p className={className}>
      {parsedBio.map((part, index) => {
        if (part.type === "link") {
          // Sanitizar URL antes de usar
          const safeUrl = sanitizeUrl(part.url || part.content);
          if (!safeUrl) {
            // Se URL não for segura, renderizar como texto
            return <span key={index}>{part.content}</span>;
          }
          return (
            <Link
              key={index}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {part.content}
            </Link>
          );
        }
        if (part.type === "emoji") {
          return (
            <span key={index} className="inline-block">
              {part.content}
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </p>
  );
}

