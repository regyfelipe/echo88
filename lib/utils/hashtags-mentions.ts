import React from "react";

/**
 * Extrai hashtags de um texto
 * @param text Texto para processar
 * @returns Array de hashtags (sem o #)
 */
export function extractHashtags(text: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.matchAll(hashtagRegex);
  const hashtags: string[] = [];

  for (const match of matches) {
    const hashtag = match[1].toLowerCase();
    if (!hashtags.includes(hashtag)) {
      hashtags.push(hashtag);
    }
  }

  return hashtags;
}

/**
 * Extrai menções de um texto
 * @param text Texto para processar
 * @returns Array de usernames mencionados (sem o @)
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const matches = text.matchAll(mentionRegex);
  const mentions: string[] = [];

  for (const match of matches) {
    const username = match[1].toLowerCase();
    if (!mentions.includes(username)) {
      mentions.push(username);
    }
  }

  return mentions;
}

/**
 * Formata texto com hashtags e menções clicáveis
 * @param text Texto para formatar
 * @param onHashtagClick Callback quando hashtag é clicada
 * @param onMentionClick Callback quando menção é clicada
 * @returns Array de elementos React
 */
export function formatTextWithHashtagsAndMentions(
  text: string,
  onHashtagClick?: (hashtag: string) => void,
  onMentionClick?: (username: string) => void
): (string | React.ReactElement)[] {
  const parts: (string | React.ReactElement)[] = [];
  const regex = /(#\w+)|(@\w+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Adiciona texto antes do match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    const value = match[1] || match[2]; // hashtag ou mention

    if (fullMatch.startsWith("#")) {
      const hashtag = value.substring(1);
      parts.push(
        React.createElement(
          "span",
          {
            key: match.index,
            className: "text-primary hover:underline cursor-pointer",
            onClick: () => onHashtagClick?.(hashtag),
          },
          fullMatch
        )
      );
    } else if (fullMatch.startsWith("@")) {
      const username = value.substring(1);
      parts.push(
        React.createElement(
          "span",
          {
            key: match.index,
            className: "text-primary hover:underline cursor-pointer",
            onClick: () => onMentionClick?.(username),
          },
          fullMatch
        )
      );
    }

    lastIndex = regex.lastIndex;
  }

  // Adiciona texto restante
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
