"use client";

import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { onOnlineStatusChange } from "@/lib/utils/offline";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const cleanup = onOnlineStatusChange((online) => {
      setIsOnline(online);
      if (!online) {
        setShow(true);
      } else {
        // Mostrar por 2 segundos quando voltar online
        setShow(true);
        setTimeout(() => setShow(false), 2000);
      }
    });

    return cleanup;
  }, []);

  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-2 transition-transform duration-300",
        show ? "translate-y-0" : "-translate-y-full",
        isOnline
          ? "bg-green-500 text-white"
          : "bg-yellow-500 text-white"
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        {isOnline ? (
          <>
            <Wifi className="size-4" />
            <span>Conexão restaurada</span>
          </>
        ) : (
          <>
            <WifiOff className="size-4" />
            <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          </>
        )}
      </div>
    </div>
  );
}

