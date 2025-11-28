"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  Logout01Icon,
  Tv02Icon,
  SmartPhone02Icon,
  Tablet01Icon,
  EarthIcon,
} from "@hugeicons/core-free-icons";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";

interface Session {
  id: string;
  deviceId: string;
  device: string;
  browser: string;
  location?: string;
  ip: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

export default function SessionsPage() {
  const { error: showError } = useToast();
  const { logoutAll } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/auth/sessions", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!confirm("Tem certeza que deseja fazer logout de todos os dispositivos?")) {
      return;
    }

    setIsLoggingOutAll(true);
    try {
      await logoutAll();
    } catch (error) {
      console.error("Error logging out all:", error);
      showError("Erro ao fazer logout", "Não foi possível fazer logout de todos os dispositivos");
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    const lowerDevice = device.toLowerCase();
    if (lowerDevice.includes("mobile") || lowerDevice.includes("android") || lowerDevice.includes("iphone")) {
      return SmartPhone02Icon;
    }
    if (lowerDevice.includes("tablet") || lowerDevice.includes("ipad")) {
      return Tablet01Icon;
    }
    return Tv02Icon;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-sm shadow-black/5">
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="size-9 sm:size-10" asChild>
                <Link href="/profile">
                  <HugeiconsIcon icon={Settings01Icon} className="size-5 sm:size-6" />
                </Link>
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold">Sessões Ativas</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-6 sm:py-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon
                icon={Tv02Icon}
                className="size-12 text-muted-foreground mb-4"
              />
              <p className="text-muted-foreground text-lg font-medium mb-1.5">
                Nenhuma sessão ativa
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Você não tem sessões ativas no momento.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Você está logado em {sessions.length} dispositivo{sessions.length !== 1 ? "s" : ""}.
                  Se você não reconhece algum dispositivo, faça logout de todos.
                </p>
                <Button
                  variant="outline"
                  onClick={handleLogoutAll}
                  disabled={isLoggingOutAll}
                  className="w-full sm:w-auto"
                >
                  <HugeiconsIcon icon={Logout01Icon} className="size-4 mr-2" />
                  {isLoggingOutAll ? "Fazendo logout..." : "Fazer logout de todos"}
                </Button>
              </div>

              <div className="space-y-3">
                {sessions.map((session) => {
                  const DeviceIcon = getDeviceIcon(session.device);
                  return (
                    <div
                      key={session.id}
                      className={cn(
                        "rounded-lg border p-4 transition-all",
                        session.isCurrent
                          ? "border-primary/50 bg-primary/5"
                          : "border-border bg-background"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "size-12 rounded-lg flex items-center justify-center shrink-0",
                            session.isCurrent
                              ? "bg-primary/10"
                              : "bg-muted"
                          )}
                        >
                          <HugeiconsIcon
                            icon={DeviceIcon}
                            className={cn(
                              "size-6",
                              session.isCurrent ? "text-primary" : "text-muted-foreground"
                            )}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm">
                              {session.device || "Dispositivo desconhecido"}
                            </p>
                            {session.isCurrent && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                                Atual
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {session.browser}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {session.location && (
                              <div className="flex items-center gap-1">
                                <HugeiconsIcon icon={EarthIcon} className="size-3" />
                                <span>{session.location}</span>
                              </div>
                            )}
                            <span>IP: {session.ip}</span>
                            <span>•</span>
                            <span>Última atividade: {formatDate(session.lastActiveAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

