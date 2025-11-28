import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share2,
  Image as ImageIcon,
  Users,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-svh bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="text-xl font-bold">Aivlo</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col gap-8 text-center lg:text-left">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                O que está
                <span className="block text-primary">acontecendo?</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto lg:mx-0">
                Conecte-se, compartilhe e descubra. Uma nova forma de expressar
                suas ideias e se conectar com pessoas ao redor do mundo.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="group">
                <Link href="/signup">
                  Começar agora
                  <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/login">Já tenho conta</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">+10k</div>
                  <div className="text-sm text-muted-foreground">Usuários</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="size-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">+50k</div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="size-5 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">+1M</div>
                  <div className="text-sm text-muted-foreground">Curtidas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview Cards */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-sm font-semibold">JD</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">João Silva</div>
                    <div className="text-xs text-muted-foreground">há 2h</div>
                  </div>
                </div>
                <p className="text-sm mb-3 line-clamp-2">
                  Acabei de terminar um projeto incrível! 🚀
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="size-4" />
                    <span>42</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    <span>8</span>
                  </div>
                  <Share2 className="size-4" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/40 flex items-center justify-center">
                    <span className="text-sm font-semibold">MC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Maria Costa</div>
                    <div className="text-xs text-muted-foreground">há 5h</div>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 h-32 mb-3 flex items-center justify-center">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="size-4" />
                    <span>128</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    <span>24</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-500/40 flex items-center justify-center">
                    <span className="text-sm font-semibold">PS</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Pedro Santos</div>
                    <div className="text-xs text-muted-foreground">há 1d</div>
                  </div>
                </div>
                <p className="text-sm mb-3 line-clamp-3">
                  Dica do dia: sempre mantenha o foco nos seus objetivos! 💪
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="size-4" />
                    <span>89</span>
                  </div>
                  <MessageCircle className="size-4" />
                </div>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl border border-border bg-card p-4 shadow-lg backdrop-blur-sm transition-transform hover:scale-105 -mt-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/40 flex items-center justify-center">
                    <span className="text-sm font-semibold">AC</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Ana Clara</div>
                    <div className="text-xs text-muted-foreground">há 3h</div>
                  </div>
                </div>
                <p className="text-sm mb-3 line-clamp-2">
                  Novo vídeo no canal! 🎬
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="size-4" />
                    <span>256</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="size-4" />
                    <span>45</span>
                  </div>
                  <Share2 className="size-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Termos de Serviço
              </Link>
              <Link
                href="#"
                className="hover:text-foreground transition-colors"
              >
                Política de Privacidade
              </Link>
            </div>
            <p>© 2025 Aivlo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
