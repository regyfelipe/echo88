/**
 * Barrel export para componentes lazy
 *
 * Centraliza todos os componentes lazy para facilitar manutenção
 * e garantir consistência no code splitting
 *
 * Nota: Type assertions são usados porque createLazyComponent retorna ComponentType<unknown>,
 * mas os type assertions finais garantem os tipos corretos no uso.
 */

import type { ComponentType } from "react";
import { createLazyComponent } from "@/lib/utils/lazy-loading";

// Importar tipos de props
import type { PostCardProps } from "@/components/posts/post-card/post-card";
import type { PostDetailModalProps } from "@/components/posts/post-detail-modal";
import type { MediaViewerProps } from "@/components/posts/media-viewer";
import type { CreatePostModalProps } from "@/components/posts/create-post-modal";
import type { EditProfileModalProps } from "@/components/profile/edit-profile-modal";
import type { ImageEditorProps } from "@/components/shared/image-editor";
import type { CommentsSectionProps } from "@/components/comments/comments-section";
import type { CollectionSelectorModalProps } from "@/components/collections/collection-selector-modal";

// Componentes de Posts
export const PostCard = createLazyComponent(
  () =>
    import("@/components/posts/post-card").then((mod) => ({
      default: mod.PostCard as ComponentType<unknown>,
    })),
  { name: "PostCard" }
) as ComponentType<PostCardProps>;

export const PostDetailModal = createLazyComponent(
  () =>
    import("@/components/posts/post-detail-modal").then((mod) => ({
      default: mod.PostDetailModal as ComponentType<unknown>,
    })),
  { name: "PostDetailModal" }
) as ComponentType<PostDetailModalProps>;

export const MediaViewer = createLazyComponent(
  () =>
    import("@/components/posts/media-viewer").then((mod) => ({
      default: mod.MediaViewer as ComponentType<unknown>,
    })),
  { name: "MediaViewer" }
) as ComponentType<MediaViewerProps>;

export const CreatePostModal = createLazyComponent(
  () =>
    import("@/components/posts/create-post-modal").then((mod) => ({
      default: mod.CreatePostModal as ComponentType<unknown>,
    })),
  { name: "CreatePostModal" }
) as ComponentType<CreatePostModalProps>;

// Componentes de Stories (sem props)
export const StoriesBar = createLazyComponent(
  () =>
    import("@/components/stories/stories-bar").then((mod) => ({
      default: mod.StoriesBar as ComponentType<unknown>,
    })),
  { name: "StoriesBar" }
) as ComponentType<Record<string, never>>;

export const StoriesViewer = createLazyComponent(
  () =>
    import("@/components/stories/stories-viewer").then((mod) => ({
      default: mod.StoriesViewer as ComponentType<unknown>,
    })),
  { name: "StoriesViewer" }
) as ComponentType<Record<string, never>>;

// Componentes de Profile
export const EditProfileModal = createLazyComponent(
  () =>
    import("@/components/profile/edit-profile-modal").then((mod) => ({
      default: mod.EditProfileModal as ComponentType<unknown>,
    })),
  { name: "EditProfileModal" }
) as ComponentType<EditProfileModalProps>;

// Componentes Compartilhados
export const ImageEditor = createLazyComponent(
  () =>
    import("@/components/shared/image-editor").then((mod) => ({
      default: mod.ImageEditor as ComponentType<unknown>,
    })),
  { name: "ImageEditor" }
) as ComponentType<ImageEditorProps>;

export const CommentsSection = createLazyComponent(
  () =>
    import("@/components/comments/comments-section").then((mod) => ({
      default: mod.CommentsSection as ComponentType<unknown>,
    })),
  { name: "CommentsSection" }
) as ComponentType<CommentsSectionProps>;

export const CollectionSelectorModal = createLazyComponent(
  () =>
    import("@/components/collections/collection-selector-modal").then(
      (mod) => ({
        default: mod.CollectionSelectorModal as ComponentType<unknown>,
      })
    ),
  { name: "CollectionSelectorModal" }
) as ComponentType<CollectionSelectorModalProps>;

// Preload estratégico de componentes comuns
if (typeof window !== "undefined") {
  // Preload após idle time
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(
      () => {
        // Preload componentes que são frequentemente usados
        import("@/components/posts/post-card").catch(() => {});
        import("@/components/stories/stories-bar").catch(() => {});
      },
      { timeout: 2000 }
    );
  }
}
