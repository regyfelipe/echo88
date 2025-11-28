/**
 * Componente para registrar Service Worker
 *
 * Registra automaticamente o SW quando o app carrega
 */

"use client";

import { useEffect, useState } from "react";
import {
  registerServiceWorker,
  onConnectionChange,
} from "@/lib/utils/service-worker";

export function ServiceWorkerRegister() {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    registerServiceWorker().then((registration) => {
      if (registration) {
        setSwRegistered(true);
        console.log("[SW] Service Worker registrado com sucesso");
      }
    });

    // Escutar mudanças de conexão
    const cleanup = onConnectionChange((online) => {
      setIsOnline(online);
      if (online) {
        console.log("[SW] Conexão restaurada");
      } else {
        console.log("[SW] Modo offline ativado");
      }
    });

    return cleanup;
  }, []);

  // Não renderizar nada, apenas registrar
  return null;
}
