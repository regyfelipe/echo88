"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  disabled?: boolean;
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  disabled = false,
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isPulling = useRef<boolean>(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    if (disabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Só ativar se estiver no topo da página
      if (container.scrollTop > 10) return;
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      // Só permitir pull down (não up)
      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        const normalizedDistance = Math.min(distance * 0.5, threshold * 1.5);
        setPullDistance(normalizedDistance);
      } else {
        setPullDistance(0);
        isPulling.current = false;
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance >= threshold && isPulling.current) {
        handleRefresh();
      } else {
        setPullDistance(0);
      }
      isPulling.current = false;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [disabled, pullDistance, threshold, handleRefresh]);

  const progress = Math.min((pullDistance / threshold) * 100, 100);
  const shouldTrigger = pullDistance >= threshold;

  return {
    containerRef,
    isRefreshing,
    pullDistance,
    progress,
    shouldTrigger,
  };
}

