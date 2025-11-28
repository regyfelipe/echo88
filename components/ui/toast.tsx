"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastVariant = "default" | "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends Toast {
  onClose: () => void;
}

const ToastComponent = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, title, description, variant = "default", onClose, action }, ref) => {
    const icons = {
      success: CheckCircle2,
      error: AlertCircle,
      info: Info,
      warning: AlertTriangle,
      default: Info,
    };

    const Icon = icons[variant];

    const variants = {
      default: "bg-background border-border text-foreground",
      success: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
      error: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
      info: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
      warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden rounded-lg border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
          variants[variant]
        )}
      >
        <Icon className="size-5 shrink-0" />
        <div className="grid gap-1 flex-1">
          {title && (
            <div className="text-sm font-semibold">{title}</div>
          )}
          {description && (
            <div className="text-sm opacity-90">{description}</div>
          )}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className={cn(
              "ml-4 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              variant === "default"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-foreground/10 hover:bg-foreground/20"
            )}
          >
            {action.label}
          </button>
        )}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }
);
ToastComponent.displayName = "Toast";

export { ToastComponent };

