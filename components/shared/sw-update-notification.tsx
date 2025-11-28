/**
 * Notificação de Atualização do Service Worker
 * 
 * Mostra notificação quando há nova versão do SW disponível
 */

"use client";

import { useEffect, useState } from "react";
import { useServiceWorker } from "@/lib/utils/service-worker";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export function SWUpdateNotification() {
  const { hasUpdate, update } = useServiceWorker();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      setIsVisible(true);
    }
  }, [hasUpdate]);

  if (!isVisible) return null;

  const handleUpdate = async () => {
    await update();
    setIsVisible(false);
    // Recarregar página após atualização
    window.location.reload();
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md",
        "animate-in slide-in-from-bottom-4 duration-500",
        !isVisible && "animate-out slide-out-to-bottom-4"
      )}
    >
      <div className="rounded-lg border border-border bg-card p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Nova versão disponível</h3>
            <p className="text-muted-foreground text-xs mb-3">
              Uma nova versão do aplicativo está disponível. Atualize para obter
              as últimas melhorias.
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                className="h-8 text-xs"
              >
                <RefreshCw className="size-3 mr-1.5" />
                Atualizar agora
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 text-xs"
              >
                Depois
              </Button>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

