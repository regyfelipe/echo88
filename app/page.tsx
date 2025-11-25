import Link from "next/link";
import { GalleryVerticalEnd } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-md flex flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-lg bg-primary/10">
            <GalleryVerticalEnd className="size-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Bem-vindo ao Echo88</h1>
          <p className="text-muted-foreground text-lg">
            Faça login ou crie sua conta para começar
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Fazer Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full">
            <Link href="/signup">Criar Conta</Link>
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Ao continuar, você concorda com nossos{" "}
          <a href="#" className="underline hover:text-foreground">
            Termos de Serviço
          </a>{" "}
          e{" "}
          <a href="#" className="underline hover:text-foreground">
            Política de Privacidade
          </a>
          .
        </p>
      </div>
    </div>
  );
}
