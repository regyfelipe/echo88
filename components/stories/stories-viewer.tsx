"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  CancelCircleIcon,
  PlayIcon,
  PauseIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface Story {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  media_thumbnail?: string;
  content?: string;
  expires_at: string;
  views_count: number;
  created_at: string;
  has_viewed: boolean;
}

interface StoryGroup {
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  stories: Story[];
}

export function StoriesViewer() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const userId = params?.userId as string;

  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  useEffect(() => {
    async function fetchStories() {
      try {
        setIsLoading(true);
        // Buscar todas as stories primeiro
        const allResponse = await fetch("/api/stories");
        if (allResponse.ok) {
          const allData = await allResponse.json();
          const allGroups = allData.stories || [];

          // Se userId fornecido, filtrar para esse usuário
          if (userId) {
            const userGroup = allGroups.find(
              (g: StoryGroup) => g.user.id === userId
            );
            if (userGroup) {
              setStoryGroups([userGroup]);
              setCurrentGroupIndex(0);
            } else {
              // Se não encontrou, buscar apenas desse usuário
              const userResponse = await fetch(`/api/stories?userId=${userId}`);
              if (userResponse.ok) {
                const userData = await userResponse.json();
                setStoryGroups(userData.stories || []);
                setCurrentGroupIndex(0);
              }
            }
          } else {
            setStoryGroups(allGroups);
          }
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStories();
  }, [userId]);

  // Registrar visualização
  useEffect(() => {
    if (currentStory && !hasViewed && user) {
      fetch(`/api/stories/${currentStory.id}/view`, {
        method: "POST",
      }).then(() => {
        setHasViewed(true);
      });
    }
  }, [currentStory?.id, hasViewed, user]);

  // Progress bar animation
  useEffect(() => {
    if (!currentStory || !isPlaying) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      return;
    }

    // Reset progress quando muda de story
    setProgress(0);
    startTimeRef.current = Date.now();

    const duration = currentStory.media_type === "video" ? 10000 : 5000; // 10s para vídeo, 5s para imagem

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        handleNextStory();
      }
    }, 50);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentStory?.id, isPlaying]);

  // Video controls
  useEffect(() => {
    if (currentStory?.media_type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentStory?.media_type, isPlaying]);

  const handleNextStory = () => {
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      setHasViewed(false);
      startTimeRef.current = Date.now();
    } else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
      setHasViewed(false);
      startTimeRef.current = Date.now();
    } else {
      handleClose();
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
      setHasViewed(false);
      startTimeRef.current = Date.now();
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1);
      const prevGroup = storyGroups[currentGroupIndex - 1];
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
      setHasViewed(false);
      startTimeRef.current = Date.now();
    }
  };

  const handleClose = () => {
    router.back();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (isLoading || !currentStory) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 p-2 space-y-1 z-10">
        <div className="flex gap-1">
          {currentGroup.stories.map((story, index) => (
            <div
              key={story.id}
              className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className={cn(
                  "h-full bg-white rounded-full transition-all",
                  index < currentStoryIndex
                    ? "w-full"
                    : index === currentStoryIndex
                    ? "w-full"
                    : "w-0"
                )}
                style={{
                  width:
                    index === currentStoryIndex ? `${progress}%` : undefined,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="absolute top-12 left-0 right-0 p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentGroup.user.avatar ? (
            <img
              src={currentGroup.user.avatar}
              alt={currentGroup.user.name}
              className="size-10 rounded-full"
            />
          ) : (
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-white font-semibold">
                {currentGroup.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-white font-semibold">
              {currentGroup.user.username}
            </p>
            <p className="text-white/70 text-xs">
              {new Date(currentStory.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <HugeiconsIcon icon={CancelCircleIcon} className="size-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex items-center justify-center h-full">
        <button
          onClick={handlePrevStory}
          className="absolute left-4 z-10 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-6" />
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          {currentStory.media_type === "image" ? (
            <img
              src={currentStory.media_url}
              alt={currentStory.content || "Story"}
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              ref={videoRef}
              src={currentStory.media_url}
              className="max-w-full max-h-full object-contain"
              onEnded={handleNextStory}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              loop={false}
            />
          )}

          {currentStory.content && (
            <div className="absolute bottom-20 left-0 right-0 px-4">
              <p className="text-white text-center text-lg drop-shadow-lg">
                {currentStory.content}
              </p>
            </div>
          )}

          {/* Play/Pause button for videos */}
          {currentStory.media_type === "video" && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 flex items-center justify-center"
            >
              {!isPlaying && (
                <div className="bg-black/50 rounded-full p-4">
                  <HugeiconsIcon
                    icon={isPlaying ? PauseIcon : PlayIcon}
                    className="size-12 text-white"
                  />
                </div>
              )}
            </button>
          )}
        </div>

        <button
          onClick={handleNextStory}
          className="absolute right-4 z-10 text-white hover:bg-white/20 rounded-full p-2 transition-colors"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-6" />
        </button>
      </div>
    </div>
  );
}

