"use client";

import { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PostHeaderProps {
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  timeAgo: string;
  category?: {
    name: string;
    icon?: React.ReactNode;
  };
}

export const PostHeader = memo(function PostHeader({
  author,
  timeAgo,
  category,
}: PostHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidAvatar =
    author.avatar && author.avatar.trim() !== "" && !imageError;

  return (
    <div className="flex items-start justify-between mb-2">
      <Link
        href={`/@${author.username}`}
        className="flex items-center gap-2.5 flex-1 min-w-0 transition-all hover:opacity-80"
      >
        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 ease-out hover:scale-110 hover:ring-2 hover:ring-primary/30 hover:shadow-md">
          {hasValidAvatar ? (
            <Image
              src={author.avatar!}
              alt={author.name}
              width={40}
              height={40}
              className="size-full object-cover"
              unoptimized
              onError={() => {
                setImageError(true);
              }}
            />
          ) : (
            <span className="text-primary font-semibold text-sm">
              {author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm truncate">{author.name}</h3>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            @{author.username}
          </p>
          {category && (
            <div className="flex items-center gap-1.5 mt-1.5 animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-foreground/5 rounded-md transition-all duration-300 hover:bg-foreground/10 hover:scale-105">
                {category.icon && (
                  <span className="text-[10px] transition-transform duration-300">
                    {category.icon}
                  </span>
                )}
                <span className="text-[10px] font-medium text-foreground/70">
                  {category.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </Link>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground">{timeAgo}</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-accent/50 rounded-full"
        >
          <MoreHorizontal className="size-4 transition-transform duration-300" />
        </Button>
      </div>
    </div>
  );
});
