"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "@/contexts/theme-context";

// Desabilitar prerender para evitar erro com ThemeProvider
export const dynamic = "force-dynamic";
import {
  Settings,
  Lock,
  Bell,
  Moon,
  Sun,
  Monitor,
  UserX,
  VolumeX,
  Download,
  Globe,
  Eye,
  EyeOff,
  MessageSquare,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings01Icon } from "@hugeicons/core-free-icons";

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const router = useRouter();
  const [isPrivate, setIsPrivate] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowDMs, setAllowDMs] = useState(true);
  const [notifications, setNotifications] = useState({
    email: true,
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    shares: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/users/settings");
      if (response.ok) {
        const data = await response.json();
        setIsPrivate(data.isPrivate || false);
        setShowOnlineStatus(data.showOnlineStatus ?? true);
        setAllowDMs(data.allowDMs ?? true);
        setNotifications({
          email: data.notificationEmail ?? true,
          likes: data.notificationLikes ?? true,
          comments: data.notificationComments ?? true,
          follows: data.notificationFollows ?? true,
          mentions: data.notificationMentions ?? true,
          shares: data.notificationShares ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/users/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPrivate,
          showOnlineStatus,
          allowDMs,
          ...notifications,
        }),
        credentials: "include",
      });

      if (response.ok) {
        setSavedMessage("Configurações salvas com sucesso!");
        setTimeout(() => setSavedMessage(null), 3000);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setSavedMessage("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch("/api/users/data-export");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `echo88-dados-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Erro ao baixar dados");
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={Settings01Icon}
              className="size-6 text-primary"
            />
            <h1 className="text-xl font-bold">Configurações</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Mensagem de sucesso */}
          {savedMessage && (
            <div
              className={`rounded-lg border p-4 ${
                savedMessage.includes("sucesso")
                  ? "border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-destructive/50 bg-destructive/10 text-destructive"
              }`}
            >
              {savedMessage}
            </div>
          )}

          {/* Privacidade */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Privacidade</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isPrivate ? (
                    <EyeOff className="size-5 text-muted-foreground" />
                  ) : (
                    <Eye className="size-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">Conta Privada</p>
                    <p className="text-sm text-muted-foreground">
                      Apenas seguidores aprovados podem ver seus posts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isPrivate ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isPrivate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Status Online</p>
                    <p className="text-sm text-muted-foreground">
                      Mostrar quando você está online
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowOnlineStatus(!showOnlineStatus)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showOnlineStatus ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showOnlineStatus ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Mensagens Diretas</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que outros usuários te enviem mensagens
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAllowDMs(!allowDMs)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    allowDMs ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      allowDMs ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Tema */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              {resolvedTheme === "dark" ? (
                <Moon className="size-5 text-primary" />
              ) : (
                <Sun className="size-5 text-primary" />
              )}
              <h2 className="text-lg font-semibold">Aparência</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Sun className="size-6" />
                <span className="text-sm font-medium">Claro</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Moon className="size-6" />
                <span className="text-sm font-medium">Escuro</span>
              </button>
              <button
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  theme === "system"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Monitor className="size-6" />
                <span className="text-sm font-medium">Sistema</span>
              </button>
            </div>
          </section>

          {/* Notificações */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Notificações</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">
                      {key === "email"
                        ? "Notificações por Email"
                        : key === "likes"
                        ? "Curtidas"
                        : key === "comments"
                        ? "Comentários"
                        : key === "follows"
                        ? "Novos Seguidores"
                        : key === "mentions"
                        ? "Menções"
                        : "Compartilhamentos"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((prev) => ({
                        ...prev,
                        [key]: !value,
                      }))
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Bloqueios e Silenciamentos */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <UserX className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Bloqueios</h2>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/settings/blocked")}
              >
                <UserX className="size-4 mr-2" />
                Usuários Bloqueados
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push("/settings/muted")}
              >
                <VolumeX className="size-4 mr-2" />
                Usuários Silenciados
              </Button>
            </div>
          </section>

          {/* Download de Dados (LGPD) */}
          <section className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <Download className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Dados Pessoais</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Baixe uma cópia dos seus dados pessoais conforme a LGPD
            </p>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleDownloadData}
            >
              <Download className="size-4 mr-2" />
              Baixar Meus Dados
            </Button>
          </section>

          {/* Botão Salvar */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur pt-4 pb-2">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}

