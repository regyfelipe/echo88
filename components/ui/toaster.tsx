"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ToastComponent, type Toast } from "./toast";
import { cn } from "@/lib/utils";

interface ToasterProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function Toaster({ toasts, onRemove }: ToasterProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      )}
    >
      {toasts.map((toast) => (
        <ToastComponent
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

