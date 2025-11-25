"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckCircle01Icon,
  Mail01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "already">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      setStatus("success");
      setMessage("Email verificado com sucesso!");
    } else if (success === "already_verified") {
      setStatus("already");
      setMessage("Seu email já foi verificado anteriormente.");
    } else if (error) {
      setStatus("error");
      if (error === "invalid_token") {
        setMessage("Token inválido ou expirado. Solicite um novo email de verificação.");
      } else {
        setMessage("Erro ao verificar email. Tente novamente.");
      }
    } else if (token) {
      // Verifica o token via API
      verifyToken(token);
    } else {
      setStatus("error");
      setMessage("Token não fornecido.");
    }
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.alreadyVerified) {
          setStatus("already");
          setMessage("Seu email já foi verificado anteriormente.");
        } else {
          setStatus("error");
          setMessage(data.error || "Erro ao verificar email");
        }
        return;
      }

      setStatus("success");
      setMessage("Email verificado com sucesso!");
    } catch (error) {
      setStatus("error");
      setMessage("Erro ao verificar email. Tente novamente.");
    }
  };

  const resendVerification = async () => {
    // Em produção, pegar email do contexto ou pedir ao usuário
    const email = prompt("Digite seu email para reenviar a verificação:");
    if (!email) return;

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Email de verificação reenviado! Verifique sua caixa de entrada.");
      } else {
        alert(data.error || "Erro ao reenviar email");
      }
    } catch (error) {
      alert("Erro ao reenviar email");
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
        {status === "loading" && (
          <>
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <HugeiconsIcon icon={Mail01Icon} className="size-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Verificando email...</h1>
            <p className="text-muted-foreground">Aguarde enquanto verificamos seu email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="size-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <HugeiconsIcon
                icon={CheckCircle01Icon}
                className="size-8 text-green-500"
              />
            </div>
            <h1 className="text-xl font-bold">Email verificado!</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild className="w-full mt-4">
              <Link href="/login">Fazer login</Link>
            </Button>
          </>
        )}

        {status === "already" && (
          <>
            <div className="size-16 rounded-full bg-blue-500/10 flex items-center justify-center">
              <HugeiconsIcon
                icon={CheckCircle01Icon}
                className="size-8 text-blue-500"
              />
            </div>
            <h1 className="text-xl font-bold">Email já verificado</h1>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild className="w-full mt-4">
              <Link href="/login">Fazer login</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="size-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-8 text-destructive"
              />
            </div>
            <h1 className="text-xl font-bold">Erro na verificação</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex flex-col gap-2 w-full mt-4">
              <Button onClick={resendVerification} variant="outline" className="w-full">
                Reenviar email de verificação
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/login">Voltar para login</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh flex-col items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

