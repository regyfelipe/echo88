"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ThumbsDownIcon,
  FavouriteIcon,
  Message01Icon,
  Navigation03Icon,
  Analytics03Icon,
  Bookmark02Icon,
  HonourStarIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface PostActionsProps {
  id?: string;
  isLiked: boolean;
  isDisliked: boolean;
  isSaved: boolean;
  isFavorited?: boolean;
  likes: number;
  comments: number;
  isLoading: boolean;
  showComments: boolean;
  onLike: (e: React.MouseEvent) => void;
  onDislike: (e: React.MouseEvent) => void;
  onSave: (e: React.MouseEvent) => void;
  onFavorite?: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onToggleComments: (e: React.MouseEvent) => void;
}

export const PostActions = memo(function PostActions({
  id,
  isLiked,
  isDisliked,
  isSaved,
  isFavorited = false,
  likes,
  comments,
  isLoading,
  showComments,
  onLike,
  onDislike,
  onSave,
  onFavorite,
  onShare,
  onToggleComments,
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between pt-2.5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
      {/* Lado esquerdo: ThumbsDownIcon, FavouriteIcon, Message01Icon */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full",
            isDisliked
              ? "text-blue-500 hover:text-blue-500 hover:bg-blue-500/10"
              : "hover:bg-accent/70"
          )}
          onClick={onDislike}
          disabled={isLoading || !id}
        >
          <HugeiconsIcon
            icon={ThumbsDownIcon}
            className={cn(
              "size-4 transition-transform duration-300",
              isDisliked && "fill-current"
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full",
            isLiked && "text-red-500 hover:text-red-500 hover:bg-red-500/10"
          )}
          onClick={onLike}
          disabled={isLoading || !id}
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            className={cn(
              "size-4 transition-all duration-500 ease-out",
              isLiked && "fill-current"
            )}
          />
          <span className="text-xs font-medium transition-all duration-300">
            {likes}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full hover:bg-accent/70"
          onClick={onToggleComments}
        >
          <HugeiconsIcon
            icon={Message01Icon}
            className="size-4 transition-transform duration-300"
          />
          <span className="text-xs font-medium">{comments}</span>
        </Button>
      </div>

      {/* Lado direito: Share, Analytics, Bookmark */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full hover:bg-accent/70"
          onClick={onShare}
          disabled={!id}
        >
          <HugeiconsIcon
            icon={Navigation03Icon}
            className="size-4 transition-transform duration-300"
          />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full hover:bg-accent/70"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Abrir modal de analytics
          }}
        >
          <HugeiconsIcon
            icon={Analytics03Icon}
            className="size-4 transition-transform duration-300"
          />
        </Button>
        {onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full",
              isFavorited && "text-yellow-500 hover:bg-yellow-500/10"
            )}
            onClick={onFavorite}
            disabled={isLoading || !id}
          >
            <HugeiconsIcon
              icon={HonourStarIcon}
              className={cn(
                "size-4 transition-all duration-500 ease-out",
                isFavorited && "fill-current"
              )}
            />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-2 sm:px-3 transition-all duration-500 ease-out hover:scale-110 active:scale-95 rounded-full",
            isSaved && "text-primary hover:bg-primary/10"
          )}
          onClick={onSave}
          disabled={isLoading || !id}
        >
          <HugeiconsIcon
            icon={Bookmark02Icon}
            className={cn(
              "size-4 transition-all duration-500 ease-out",
              isSaved && "fill-current"
            )}
          />
        </Button>
      </div>
    </div>
  );
});
