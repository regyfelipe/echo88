"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePostModal } from "@/components/create-post-modal";

const navigationItems = [
  { href: "/feed", icon: Home, label: "Início" },
  { href: "/explore", icon: Search, label: "Explorar" },
  { href: "/create", icon: PlusCircle, label: "Criar" },
  { href: "/notifications", icon: Bell, label: "Notificações" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
        <div className="rounded-2xl border border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 shadow-xl transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
          <div className="flex items-center justify-around px-2 py-2.5 sm:py-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isCreate = item.href === "/create";

              if (isCreate) {
                return (
                  <button
                    key={item.href}
                    onClick={() => setIsCreateModalOpen(true)}
                    className={cn(
                      "flex flex-col items-center gap-0 sm:gap-1 rounded-lg px-3 sm:px-4 py-2 transition-all duration-500 ease-out hover:scale-110 active:scale-95 touch-manipulation",
                      isActive
                        ? "text-primary bg-primary/10 shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    )}
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <Icon
                      className={cn(
                        "size-6 sm:size-6 transition-all duration-500 ease-out",
                        isActive && "fill-current scale-110 animate-pulse"
                      )}
                    />
                    <span
                      className={cn(
                        "hidden sm:block text-xs font-medium transition-all duration-500 ease-out",
                        isActive && "scale-105 font-semibold"
                      )}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0 sm:gap-1 rounded-lg px-3 sm:px-4 py-2 transition-all duration-500 ease-out hover:scale-110 active:scale-95 touch-manipulation",
                    isActive
                      ? "text-primary bg-primary/10 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <Icon
                    className={cn(
                      "size-6 sm:size-6 transition-all duration-500 ease-out",
                      isActive && "fill-current scale-110 animate-pulse"
                    )}
                  />
                  <span
                    className={cn(
                      "hidden sm:block text-xs font-medium transition-all duration-500 ease-out",
                      isActive && "scale-105 font-semibold"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
