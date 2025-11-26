import { useState, useEffect, useCallback } from "react";

interface SearchPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar?: string;
  };
  content?: string;
  type: string;
  media?: { url: string; thumbnail?: string };
  gallery?: unknown;
  document?: { url: string; name: string };
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
}

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface SearchHashtag {
  id: string;
  name: string;
  postsCount: number;
}

interface SearchResult {
  posts: SearchPost[];
  users: SearchUser[];
  hashtags: SearchHashtag[];
}

interface UseSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceMs = 500, minQueryLength = 2 } = options;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({
    posts: [],
    users: [],
    hashtags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Carregar histórico do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("echo88_search_history");
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error parsing search history:", e);
      }
    }
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string, type: string = "all") => {
      if (!searchQuery.trim() || searchQuery.trim().length < minQueryLength) {
        setResults({ posts: [], users: [], hashtags: [] });
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchQuery)}&type=${type}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar");
        }

        const data = await response.json();
        setResults({
          posts: data.posts || [],
          users: data.users || [],
          hashtags: data.hashtags || [],
        });

        // Salvar no histórico
        if (searchQuery.trim().length >= minQueryLength) {
          const newHistory = [
            searchQuery.trim(),
            ...searchHistory.filter((h) => h !== searchQuery.trim()),
          ].slice(0, 10);
          setSearchHistory(newHistory);
          localStorage.setItem(
            "echo88_search_history",
            JSON.stringify(newHistory)
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao buscar";
        setError(errorMessage);
        console.error("Error performing search:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [minQueryLength, searchHistory]
  );

  // Debounce da busca
  useEffect(() => {
    if (!query.trim() || query.trim().length < minQueryLength) {
      setResults({ posts: [], users: [], hashtags: [] });
      return;
    }

    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, minQueryLength, performSearch]);

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults({ posts: [], users: [], hashtags: [] });
    setError(null);
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("echo88_search_history");
  }, []);

  const searchFromHistory = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
  }, []);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    searchHistory,
    performSearch,
    clearSearch,
    clearHistory,
    searchFromHistory,
  };
}
