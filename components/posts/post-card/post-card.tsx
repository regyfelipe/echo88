"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { MediaViewer } from "../media-viewer";
import { CommentsSection } from "../../comments/comments-section";
import { PostHeader } from "./post-header";
import { PostMedia } from "./post-media";
import { PostActions } from "./post-actions";
import { CollectionSelectorModal } from "@/components/collections/collection-selector-modal";
import { postsApi } from "@/lib/api/posts";

export type PostType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "gallery"
  | "document";

export type MediaItem = {
  url: string;
  type: "image" | "video";
  thumbnail?: string;
  title?: string;
  artist?: string;
};

export interface PostCardProps {
  id?: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  type: PostType;
  media?: {
    url: string;
    thumbnail?: string;
    title?: string;
    artist?: string;
  };
  gallery?: MediaItem[];
  document?: {
    url: string;
    name: string;
  };
  category?: {
    name: string;
    icon?: React.ReactNode;
  };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFavorited?: boolean;
}

export function PostCard({
  id,
  author,
  content,
  type,
  media,
  gallery,
  document,
  category,
  likes: initialLikes,
  comments,
  shares,
  timeAgo,
  isLiked: initialIsLiked = false,
  isSaved: initialIsSaved = false,
  isFavorited: initialIsFavorited = false,
}: PostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [isLoading, setIsLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);

  // Verificar status de dislike e favorite ao carregar
  useEffect(() => {
    if (!id) return;

    Promise.all([
      postsApi.getDislikeStatus(id).catch(() => ({ isDisliked: false })),
      postsApi.getFavoriteStatus(id).catch(() => ({ isFavorited: false })),
    ]).then(([dislikeData, favoriteData]) => {
      setIsDisliked(dislikeData.isDisliked || false);
      setIsFavorited(favoriteData.isFavorited || false);
    });
  }, [id]);

  // Função para curtir/descurtir
  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || isLoading) return;

      setIsLoading(true);
      try {
        const data = await postsApi.like(id);
        setIsLiked(data.liked);
        // Se curtiu, remover dislike
        if (data.liked && isDisliked) {
          setIsDisliked(false);
        }
        setLikes((prev) => (data.liked ? prev + 1 : Math.max(prev - 1, 0)));
      } catch (error) {
        console.error("Error liking post:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, isLoading, isDisliked]
  );

  // Função para não curtir/remover não curtir
  const handleDislike = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || isLoading) return;

      setIsLoading(true);
      try {
        const data = await postsApi.dislike(id);
        setIsDisliked(data.disliked);
        // Se não curtiu, remover like
        if (data.disliked && isLiked) {
          setIsLiked(false);
          setLikes((prev) => Math.max(prev - 1, 0));
        }
      } catch (error) {
        console.error("Error disliking post:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, isLoading, isLiked]
  );

  // Função para salvar/remover - agora abre modal de coleções
  const handleSave = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id) return;

      // Se já está salvo, apenas remover
      if (isSaved) {
        setIsLoading(true);
        try {
          const data = await postsApi.save(id);
          setIsSaved(data.saved);
        } catch (error) {
          console.error("Error saving post:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Se não está salvo, abrir modal para escolher coleção
        setIsCollectionModalOpen(true);
      }
    },
    [id, isSaved, isLoading]
  );

  // Função para compartilhar
  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id) return;

      try {
        const data = await postsApi.share(id);
        // Abrir modal de compartilhamento ou copiar link
        if (navigator.share) {
          await navigator.share({
            title: `Post de @${author.username}`,
            text: content || "",
            url: data.shareUrl,
          });
        } else {
          // Fallback: copiar para clipboard
          await navigator.clipboard.writeText(data.shareUrl);
          alert("Link copiado para a área de transferência!");
        }
      } catch (error) {
        console.error("Error sharing post:", error);
      }
    },
    [id, author.username, content]
  );

  // Função para registrar visualização
  useEffect(() => {
    if (id && (type === "image" || type === "video" || type === "gallery")) {
      postsApi.view(id);
    }
  }, [id, type]);

  // Memoizar handlers para evitar re-renders desnecessários
  const handleToggleComments = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowComments(!showComments);
    },
    [showComments]
  );

  const handleMediaClick = useCallback(() => {
    // Apenas vídeos e galerias abrem o modal, imagens simples não
    if (type === "video" || type === "gallery") {
      setIsModalOpen(true);
    }
  }, [type]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Função para favoritar/desfavoritar
  const handleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!id || isLoading) return;

      setIsLoading(true);
      try {
        const data = await postsApi.favorite(id);
        setIsFavorited(data.favorited);
      } catch (error) {
        console.error("Error favoriting post:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [id, isLoading]
  );

  // Memoizar se deve mostrar o MediaViewer (apenas vídeos e galerias)
  const shouldShowMediaViewer = useMemo(
    () => (type === "gallery" || type === "video") && isModalOpen,
    [type, isModalOpen]
  );

  return (
    <article className="bg-background animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out hover:shadow-sm transition-all duration-500">
      <div className="p-4 hover:bg-accent/20 transition-colors duration-500 ease-out">
        {/* Header */}
        <PostHeader author={author} timeAgo={timeAgo} category={category} />

        {/* Content */}
        {content && (
          <p className="text-sm mb-2.5 whitespace-pre-wrap leading-relaxed text-foreground/90 animate-in fade-in duration-500 delay-75">
            {content}
          </p>
        )}

        {/* Media */}
        <PostMedia
          type={type}
          media={media}
          gallery={gallery}
          document={document}
          content={content}
          onMediaClick={handleMediaClick}
        />

        {/* Actions */}
        <PostActions
          id={id}
          isLiked={isLiked}
          isDisliked={isDisliked}
          isSaved={isSaved}
          isFavorited={isFavorited}
          likes={likes}
          comments={comments}
          isLoading={isLoading}
          showComments={showComments}
          onLike={handleLike}
          onDislike={handleDislike}
          onSave={handleSave}
          onFavorite={handleFavorite}
          onShare={handleShare}
          onToggleComments={handleToggleComments}
        />
      </div>

      {/* Seção de Comentários */}
      {showComments && id && (
        <CommentsSection
          postId={id}
          onCommentAdded={() => {
            // Atualizar contador de comentários se necessário
            // O feed será atualizado na próxima renderização
          }}
        />
      )}

      {/* Media Viewer - Flutuante e Único */}
      {shouldShowMediaViewer && (
        <MediaViewer
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          author={author}
          content={content}
          media={media}
          gallery={gallery}
          likes={likes}
          comments={comments}
          shares={shares}
          timeAgo={timeAgo}
          isLiked={isLiked}
          isSaved={isSaved}
        />
      )}

      {/* Collection Selector Modal */}
      {id && (
        <CollectionSelectorModal
          isOpen={isCollectionModalOpen}
          onClose={() => setIsCollectionModalOpen(false)}
          postId={id}
          onPostAdded={async () => {
            setIsCollectionModalOpen(false);
            setIsSaved(true);
            // Opcional: atualizar contador de saves
          }}
        />
      )}
    </article>
  );
}
