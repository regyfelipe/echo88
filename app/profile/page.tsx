import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Settings, Edit } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold">Perfil</h1>
          <Button variant="ghost" size="icon">
            <Settings className="size-5" />
          </Button>
        </div>
      </header>

      {/* Profile Header */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col items-center gap-4">
            <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
              <span className="text-primary font-bold text-3xl">U</span>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Seu Nome</h2>
              <p className="text-muted-foreground">@seuusuario</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="size-4" />
              Editar Perfil
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <p className="text-xl font-bold">42</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">128</p>
              <p className="text-sm text-muted-foreground">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">89</p>
              <p className="text-sm text-muted-foreground">Seguindo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl">
          <div className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Seus posts aparecerão aqui
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
