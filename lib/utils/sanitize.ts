/**
 * Sanitization Utilities
 *
 * Utilitários para sanitizar conteúdo do usuário usando DOMPurify
 */

import DOMPurify from "isomorphic-dompurify";

/**
 * Tipo para configuração do DOMPurify
 */
type DOMPurifyConfig = Parameters<typeof DOMPurify.sanitize>[1];

/**
 * Configuração padrão do DOMPurify
 */
const DEFAULT_CONFIG: DOMPurifyConfig = {
  // Permitir apenas tags seguras
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "span",
    "div",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ],
  // Permitir apenas atributos seguros
  ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
  // Permitir data attributes para funcionalidades específicas
  ALLOW_DATA_ATTR: false,
  // Remover conteúdo vazio
  KEEP_CONTENT: true,
  // Retornar string em vez de DOM
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
  // Sanitizar URLs
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  // Adicionar rel="noopener noreferrer" em links externos
  ADD_ATTR: ["target"],
  ADD_TAGS: [],
  // Remover scripts e eventos
  FORBID_TAGS: [
    "script",
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
  ],
  FORBID_ATTR: [
    "onerror",
    "onload",
    "onclick",
    "onmouseover",
    "onfocus",
    "onblur",
  ],
};

/**
 * Configuração para conteúdo rico (posts, comentários)
 */
const RICH_CONTENT_CONFIG: DOMPurifyConfig = {
  ...DEFAULT_CONFIG,
  ALLOWED_TAGS: [
    ...DEFAULT_CONFIG.ALLOWED_TAGS!,
    "img",
    "video",
    "audio",
    "source",
    "track",
  ],
  ALLOWED_ATTR: [
    ...DEFAULT_CONFIG.ALLOWED_ATTR!,
    "src",
    "alt",
    "width",
    "height",
    "controls",
    "poster",
    "preload",
    "type",
  ],
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
};

/**
 * Configuração para bio (mais restritiva)
 */
const BIO_CONFIG: DOMPurifyConfig = {
  ...DEFAULT_CONFIG,
  ALLOWED_TAGS: ["p", "br", "strong", "em", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

/**
 * Sanitiza conteúdo HTML
 */
export function sanitizeHtml(
  html: string,
  config: DOMPurifyConfig = DEFAULT_CONFIG
): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  try {
    return DOMPurify.sanitize(html, config) as string;
  } catch (error) {
    console.error("[Sanitize] Erro ao sanitizar HTML:", error);
    // Em caso de erro, retornar string vazia ou texto limpo
    return html.replace(/<[^>]*>/g, "");
  }
}

/**
 * Sanitiza conteúdo de texto simples (remove HTML)
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  try {
    // Remove todas as tags HTML
    const withoutTags = text.replace(/<[^>]*>/g, "");
    // Decodifica entidades HTML
    const decoded = DOMPurify.sanitize(withoutTags, { ALLOWED_TAGS: [] });
    return decoded.trim();
  } catch (error) {
    console.error("[Sanitize] Erro ao sanitizar texto:", error);
    return text.replace(/<[^>]*>/g, "").trim();
  }
}

/**
 * Sanitiza bio do usuário
 */
export function sanitizeBio(bio: string | null | undefined): string {
  if (!bio) return "";
  return sanitizeHtml(bio, BIO_CONFIG);
}

/**
 * Sanitiza conteúdo de post ou comentário
 */
export function sanitizePostContent(
  content: string | null | undefined
): string {
  if (!content) return "";
  return sanitizeHtml(content, RICH_CONTENT_CONFIG);
}

/**
 * Sanitiza URL
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";

  try {
    // Verificar se é uma URL válida
    const urlObj = new URL(url);

    // Permitir apenas protocolos seguros
    const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return "";
    }

    // Sanitizar a URL
    return DOMPurify.sanitize(url, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  } catch {
    // Se não for uma URL válida, retornar vazio
    return "";
  }
}

/**
 * Sanitiza objeto com múltiplos campos
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  fields: Array<keyof T>
): T {
  const sanitized = { ...obj };

  for (const field of fields) {
    if (typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeHtml(sanitized[field] as string) as T[keyof T];
    }
  }

  return sanitized;
}

/**
 * Verifica se uma string contém HTML potencialmente perigoso
 */
export function containsDangerousHtml(html: string): boolean {
  if (!html || typeof html !== "string") return false;

  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /javascript:/i,
    /data:text\/html/i,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(html));
}

/**
 * Sanitiza e limita tamanho do conteúdo
 */
export function sanitizeAndTruncate(
  content: string,
  maxLength: number = 500
): string {
  const sanitized = sanitizeText(content);
  if (sanitized.length <= maxLength) {
    return sanitized;
  }
  return sanitized.substring(0, maxLength) + "...";
}
