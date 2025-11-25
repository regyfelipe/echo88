"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Mail01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar email");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon icon={Mail01Icon} className="size-8 text-primary" />
            </div>
            <h1 className="text-xl font-bold">Email enviado!</h1>
            <FieldDescription>
              Se o email existir em nossa base, você receberá instruções para
              redefinir sua senha.
            </FieldDescription>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/login">Voltar para login</Link>
            </Button>
          </div>
        </FieldGroup>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Recuperar senha</h1>
            <FieldDescription>
              Digite seu email e enviaremos instruções para redefinir sua senha.
            </FieldDescription>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>

          <Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar instruções"}
            </Button>
          </Field>

          <Field>
            <Button
              type="button"
              variant="ghost"
              asChild
              className="w-full"
            >
              <Link href="/login" className="flex items-center gap-2">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                Voltar para login
              </Link>
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

