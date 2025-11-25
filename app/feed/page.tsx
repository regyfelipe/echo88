import { BottomNavigation } from "@/components/bottom-navigation";
import { PostCard } from "@/components/post-card";
import { InlineAd } from "@/components/google-ad";

export default function FeedPage() {
  const posts = [
    {
      author: {
        name: "João Silva",
        username: "joaosilva",
        avatar: undefined,
      },
      content:
        "Acabei de terminar um projeto incrível! 🚀\n\nEstou muito feliz com o resultado. O que vocês acham?",
      type: "text" as const,
      likes: 42,
      comments: 8,
      shares: 5,
      timeAgo: "2h",
      isLiked: false,
      isSaved: false,
    },
    {
      author: {
        name: "Maria Santos",
        username: "mariasantos",
        avatar: undefined,
      },
      content: "Pôr do sol de hoje foi simplesmente perfeito! 🌅",
      type: "image" as const,
      media: {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      likes: 128,
      comments: 15,
      shares: 23,
      timeAgo: "5h",
      isLiked: true,
      isSaved: true,
    },
    {
      author: {
        name: "Pedro Costa",
        username: "pedrocosta",
        avatar: undefined,
      },
      type: "audio" as const,
      media: {
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        title: "Minha Nova Música",
        artist: "Pedro Costa",
      },
      content:
        "Acabei de lançar minha nova música! Ouçam e me digam o que acharam 🎵",
      likes: 267,
      comments: 45,
      shares: 12,
      timeAgo: "1d",
      isLiked: false,
      isSaved: false,
    },
    {
      author: {
        name: "Ana Oliveira",
        username: "anaoliveira",
        avatar: undefined,
      },
      type: "video" as const,
      media: {
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      },
      content: "Vídeo do meu último projeto! 🎬",
      likes: 189,
      comments: 33,
      shares: 18,
      timeAgo: "2d",
      isLiked: false,
      isSaved: true,
    },
    {
      author: {
        name: "Carlos Mendes",
        username: "carlosmendes",
        avatar: undefined,
      },
      type: "image" as const,
      media: {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
      },
      likes: 94,
      comments: 7,
      shares: 3,
      timeAgo: "3d",
      isLiked: true,
      isSaved: false,
    },
    {
      author: {
        name: "Julia Ferreira",
        username: "juliaferreira",
        avatar: undefined,
      },
      content:
        "Dica do dia: sempre mantenha o código limpo e bem documentado. Isso facilita muito a manutenção! 💻\n\n#programming #coding #tips",
      type: "text" as const,
      likes: 67,
      comments: 12,
      shares: 8,
      timeAgo: "4d",
      isLiked: false,
      isSaved: false,
    },
    {
      author: {
        name: "Lucas Almeida",
        username: "lucasalmeida",
        avatar: undefined,
      },
      content: "Minha viagem incrível! 📸✨",
      type: "gallery" as const,
      category: {
        name: "Digital",
      },
      gallery: [
        {
          type: "image" as const,
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        },
        {
          type: "image" as const,
          url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
        },
      ],
      likes: 234,
      comments: 28,
      shares: 15,
      timeAgo: "12h",
      isLiked: true,
      isSaved: true,
    },
    {
      author: {
        name: "Fernanda Lima",
        username: "fernandalima",
        avatar: undefined,
      },
      content: "Meu projeto em desenvolvimento! 🎬",
      type: "gallery" as const,
      category: {
        name: "Pixelise",
      },
      gallery: [
        {
          type: "image" as const,
          url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
        },
      ],
      likes: 156,
      comments: 19,
      shares: 7,
      timeAgo: "1sem",
      isLiked: false,
      isSaved: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 animate-in fade-in slide-in-from-top-4 duration-700 ease-out shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <h1 className="text-lg sm:text-xl font-bold transition-all duration-500 ease-out">
            Echo88
          </h1>
          <div className="flex items-center gap-2">
            <div className="size-9 sm:size-10 rounded-full bg-primary/20 flex items-center justify-center transition-all duration-500 ease-out hover:scale-110 hover:ring-2 hover:ring-primary/30 hover:shadow-md cursor-pointer touch-manipulation">
              <span className="text-primary font-semibold text-sm sm:text-base">
                U
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Feed */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-2 sm:px-4">
          {posts.map((post, index) => (
            <div key={index}>
              <div
                className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out mb-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: "both",
                }}
              >
                <PostCard {...post} />
              </div>

              {/* Anúncio do Google após cada 3 postagens */}
              {(index + 1) % 3 === 0 && index < posts.length - 1 && (
                <InlineAd />
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
