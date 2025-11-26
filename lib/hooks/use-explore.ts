import { useState, useEffect, useCallback } from "react";
import { postsApi } from "@/lib/api/posts";
import type { Post } from "@/lib/types/post";

interface SearchUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  followersCount?: number;
}

interface SearchHashtag {
  id: string;
  name: string;
  postsCount: number;
}

type SearchType = "all" | "posts" | "users" | "hashtags";
type ExploreMode = "popular" | "trending" | "search";

export function useExplore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [exploreMode, setExploreMode] = useState<ExploreMode>("popular");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [hashtags, setHashtags] = useState<SearchHashtag[]>([]);
  const [trendingHashtags, setTrendingHashtags] = useState<SearchHashtag[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<SearchUser[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar histórico de buscas do localStorage
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

  const fetchPopularPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await postsApi.getPopular(30);
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching popular posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTrendingPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await postsApi.getTrending(30);
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching trending posts:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTrendingHashtags = useCallback(async () => {
    interface HashtagRow {
      id: string;
      name: string;
      posts_count?: number;
    }
    try {
      const response = await fetch("/api/hashtags/trending");
      if (response.ok) {
        const data = await response.json();
        setTrendingHashtags(
          ((data.hashtags as HashtagRow[] | null) || []).map((h) => ({
            id: h.id,
            name: h.name,
            postsCount: h.posts_count || 0,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
    }
  }, []);

  const fetchUserSuggestions = useCallback(async () => {
    try {
      const response = await fetch("/api/users/suggestions?limit=10");
      if (response.ok) {
        const data = await response.json();
        setUserSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Error fetching user suggestions:", error);
    }
  }, []);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}`
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setUsers(data.users || []);
        setHashtags(data.hashtags || []);

        // Salvar no histórico de buscas
        if (searchQuery.trim().length >= 2) {
          const newHistory = [
            searchQuery.trim(),
            ...searchHistory.filter((h) => h !== searchQuery.trim()),
          ].slice(0, 10); // Manter apenas últimas 10 buscas
          setSearchHistory(newHistory);
          localStorage.setItem(
            "echo88_search_history",
            JSON.stringify(newHistory)
          );
        }
      }
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, searchType, searchHistory]);

  // Buscar posts populares, trending e sugestões quando não há query
  useEffect(() => {
    if (!searchQuery.trim()) {
      if (exploreMode === "popular") {
        fetchPopularPosts();
      } else if (exploreMode === "trending") {
        fetchTrendingPosts();
      }
      fetchTrendingHashtags();
      fetchUserSuggestions();
    }
  }, [
    exploreMode,
    searchQuery,
    fetchPopularPosts,
    fetchTrendingPosts,
    fetchTrendingHashtags,
    fetchUserSuggestions,
  ]);

  // Buscar quando há query
  useEffect(() => {
    if (searchQuery.trim()) {
      setExploreMode("search");
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setExploreMode("popular");
      fetchPopularPosts();
    }
  }, [searchQuery, searchType, performSearch, fetchPopularPosts]);

  const handleSearchFromHistory = useCallback((query: string) => {
    setSearchQuery(query);
    setExploreMode("search");
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem("echo88_search_history");
  }, []);

  return {
    // Estado
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    exploreMode,
    setExploreMode,
    posts,
    users,
    hashtags,
    trendingHashtags,
    userSuggestions,
    searchHistory,
    isLoading,
    // Ações
    handleSearchFromHistory,
    clearSearchHistory,
    fetchPopularPosts,
    fetchTrendingPosts,
  };
}
