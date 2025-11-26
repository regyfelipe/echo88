import { useState, useEffect, useCallback } from "react";

export type FeedType = "chronological" | "relevance" | "personalized";

export function useFeedPreferences() {
  const [feedType, setFeedType] = useState<FeedType>("chronological");
  const [isLoading, setIsLoading] = useState(true);

  // Carregar preferências
  useEffect(() => {
    fetch("/api/users/feed-preferences")
      .then((res) => res.json())
      .then((data) => {
        setFeedType(data.feedType || "chronological");
      })
      .catch(() => {
        setFeedType("chronological");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Atualizar preferências
  const updateFeedType = useCallback(async (newType: FeedType) => {
    try {
      const response = await fetch("/api/users/feed-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedType: newType }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedType(data.feedType);
      }
    } catch (error) {
      console.error("Error updating feed preferences:", error);
    }
  }, []);

  return {
    feedType,
    setFeedType: updateFeedType,
    isLoading,
  };
}
