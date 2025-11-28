"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import type { Toast, ToastVariant } from "@/components/ui/toast";

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (props: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const duration = props.duration ?? 5000;

      const newToast: Toast = {
        ...props,
        id,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto remover após a duração
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: "success" });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: "error" });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: "info" });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) => {
      addToast({ title, description, variant: "warning" });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toast: addToast,
        success,
        error,
        info,
        warning,
      }}
    >
      {children}
      <Toaster toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

