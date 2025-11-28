"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => Promise<void> | void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    await onLoadMore();
  }, [isLoading, hasMore, onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        setIsIntersecting(entry.isIntersecting);

        if (entry.isIntersecting && hasMore && !isLoading) {
          handleLoadMore();
        }
      },
      {
        rootMargin,
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinel);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoading, rootMargin, handleLoadMore]);

  return {
    sentinelRef,
    isIntersecting,
  };
}

