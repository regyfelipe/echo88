"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Navigation03Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "@/contexts/auth-context";
import { formatTextWithHashtagsAndMentions } from "@/lib/utils/hashtags-mentions";
import { sanitizePostContent } from "@/lib/utils/sanitize";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  replies_count: number;
  users: {
    id: string;
    full_name: string;
    username: string;
    avatar_url?: string;
  };
  replies?: Comment[];
}

export interface CommentsSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentsSection({ postId, onCommentAdded }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: commentText.trim(),
        }),
      });

      if (response.ok) {
        setCommentText("");
        await fetchComments();
        onCommentAdded?.();
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          content: replyText.trim(),
          parentId,
        }),
      });

      if (response.ok) {
        setReplyText("");
        setReplyingTo(null);
        await fetchComments();
        onCommentAdded?.();
      }
    } catch (error) {
      console.error("Error creating reply:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "agora";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}sem`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}mes`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}ano${diffInYears > 1 ? "s" : ""}`;
  };

  if (isLoading) {
    return (
      <div className="px-4 py-3 border-t border-border">
        <div className="text-center py-4">
          <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Carregando comentários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {/* Formulário de comentário */}
      {user && (
        <form onSubmit={handleSubmitComment} className="px-4 py-3 border-b border-border">
          <div className="flex gap-2">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-primary text-xs font-semibold">
                {user.fullName?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 flex gap-2">
              <Textarea
                ref={textareaRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Adicione um comentário..."
                className="min-h-[40px] max-h-[120px] resize-none text-sm"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment(e);
                  }
                }}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!commentText.trim() || isSubmitting}
                className="shrink-0 size-10"
              >
                <HugeiconsIcon icon={Navigation03Icon} className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Lista de comentários */}
      <div className="max-h-[400px] overflow-y-auto">
        {comments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          </div>
        ) : (
          <div className="px-4 py-2 space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                {/* Comentário principal */}
                <div className="flex gap-2">
                  <Link
                    href={`/@${comment.users.username}`}
                    className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {comment.users.avatar_url ? (
                      <img
                        src={comment.users.avatar_url}
                        alt={comment.users.username}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-primary text-xs font-semibold">
                        {comment.users.full_name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/50 rounded-2xl px-3 py-2">
                      <div className="flex items-baseline gap-2 mb-1">
                        <Link
                          href={`/@${comment.users.username}`}
                          className="font-semibold text-sm hover:underline"
                        >
                          {comment.users.username}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(comment.created_at)}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap break-words">
                        {formatTextWithHashtagsAndMentions(
                          sanitizePostContent(comment.content)
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Responder
                      </button>
                      {comment.replies_count > 0 && (
                        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {comment.replies_count} resposta{comment.replies_count !== 1 ? "s" : ""}
                        </button>
                      )}
                    </div>

                    {/* Formulário de resposta */}
                    {replyingTo === comment.id && user && (
                      <form
                        onSubmit={(e) => handleSubmitReply(comment.id, e)}
                        className="mt-2 flex gap-2"
                      >
                        <Textarea
                          ref={replyTextareaRef}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Responder a @${comment.users.username}...`}
                          className="min-h-[36px] max-h-[100px] resize-none text-sm flex-1"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitReply(comment.id, e);
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          size="icon"
                          disabled={!replyText.trim() || isSubmitting}
                          className="shrink-0 size-9"
                        >
                          <HugeiconsIcon icon={Navigation03Icon} className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          className="shrink-0 size-9"
                        >
                          Cancelar
                        </Button>
                      </form>
                    )}

                    {/* Respostas */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2 border-l-2 border-border pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <Link
                              href={`/@${reply.users.username}`}
                              className="size-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity"
                            >
                              {reply.users.avatar_url ? (
                                <img
                                  src={reply.users.avatar_url}
                                  alt={reply.users.username}
                                  className="size-7 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-primary text-[10px] font-semibold">
                                  {reply.users.full_name?.[0]?.toUpperCase() || "U"}
                                </span>
                              )}
                            </Link>
                            <div className="flex-1 min-w-0">
                              <div className="bg-muted/30 rounded-xl px-3 py-1.5">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                  <Link
                                    href={`/@${reply.users.username}`}
                                    className="font-semibold text-xs hover:underline"
                                  >
                                    {reply.users.username}
                                  </Link>
                                  <span className="text-[10px] text-muted-foreground">
                                    {getTimeAgo(reply.created_at)}
                                  </span>
                                </div>
                                <div className="text-xs whitespace-pre-wrap break-words">
                                  {formatTextWithHashtagsAndMentions(
                                    sanitizePostContent(reply.content)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
