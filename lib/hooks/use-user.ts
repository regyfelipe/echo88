import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  isFollowing?: boolean;
  isPrivate?: boolean;
}

interface UseUserOptions {
  userId?: string;
  username?: string;
  autoFetch?: boolean;
}

export function useUser(options: UseUserOptions = {}) {
  const { userId, username, autoFetch = true } = options;
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId && !username) {
      setError("ID ou username do usuário é necessário");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = userId
        ? `/api/users/${userId}`
        : `/api/users/username/${username}`;
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Erro ao buscar usuário");
      }

      const data = await response.json();
      setUser(data.user || data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar usuário";
      setError(errorMessage);
      console.error("Error fetching user:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, username]);

  useEffect(() => {
    if (autoFetch) {
      fetchUser();
    }
  }, [autoFetch, fetchUser]);

  const follow = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: data.following,
                followersCount: data.followersCount || prev.followersCount,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error following user:", err);
    }
  }, [user?.id]);

  const unfollow = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/users/${user.id}/follow`, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: false,
                followersCount: data.followersCount || prev.followersCount,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  }, [user?.id]);

  const refetch = useCallback(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    isLoading,
    error,
    follow,
    unfollow,
    refetch,
  };
}
