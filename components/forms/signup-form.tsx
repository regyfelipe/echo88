"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { GalleryVerticalEnd, User, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface AvailabilityStatus {
  available: boolean | null; // null = não verificado ainda
  message?: string;
  checking: boolean;
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de disponibilidade
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>({
    available: null,
    checking: false,
  });
  const [emailStatus, setEmailStatus] = useState<AvailabilityStatus>({
    available: null,
    checking: false,
  });

  // Debounce para verificação
  const checkAvailability = useCallback(
    async (field: "username" | "email", value: string) => {
      if (!value || value.trim().length === 0) {
        if (field === "username") {
          setUsernameStatus({ available: null, checking: false });
        } else {
          setEmailStatus({ available: null, checking: false });
        }
        return;
      }

      // Atualiza estado para "verificando"
      if (field === "username") {
        setUsernameStatus({ available: null, checking: true });
      } else {
        setEmailStatus({ available: null, checking: true });
      }

      try {
        const response = await fetch("/api/auth/check-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [field]: value,
          }),
        });

        const data = await response.json();

        if (response.ok && data[field]) {
          if (field === "username") {
            setUsernameStatus({
              available: data[field].available,
              message: data[field].message,
              checking: false,
            });
          } else {
            setEmailStatus({
              available: data[field].available,
              message: data[field].message,
              checking: false,
            });
          }
        }
      } catch (error) {
        console.error("Error checking availability:", error);
        if (field === "username") {
          setUsernameStatus({ available: null, checking: false });
        } else {
          setEmailStatus({ available: null, checking: false });
        }
      }
    },
    []
  );

  // Debounce para username
  useEffect(() => {
    if (step !== 1) return;

    const timeoutId = setTimeout(() => {
      if (username.trim().length >= 3) {
        checkAvailability("username", username);
      } else {
        setUsernameStatus({ available: null, checking: false });
      }
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [username, step, checkAvailability]);

  // Debounce para email
  useEffect(() => {
    if (step !== 2) return;

    const timeoutId = setTimeout(() => {
      if (email.trim().length > 0) {
        checkAvailability("email", email);
      } else {
        setEmailStatus({ available: null, checking: false });
      }
    }, 500); // Aguarda 500ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [email, step, checkAvailability]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && fullName.trim()) {
      setStep(2);
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPasswordErrors([]);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }

    setIsLoading(true);

    try {
      // Primeiro cria o usuário (sem avatar)
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          fullName,
          password,
          // Avatar será enviado depois
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        if (signupData.errors) {
          setPasswordErrors(signupData.errors);
        }
        throw new Error(signupData.error || "Erro ao criar conta");
      }

      // Se tiver avatar e usuário foi criado, faz upload do avatar
      if (avatar && signupData.user?.id) {
        try {
          const formData = new FormData();
          formData.append("file", avatar);
          formData.append("bucket", "avatars");
          formData.append("userId", signupData.user.id);

          const uploadResponse = await fetch("/api/storage/upload-signup", {
            method: "POST",
            body: formData,
          });

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            // Atualiza o usuário com a URL do avatar
            await fetch("/api/auth/update-avatar-signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: signupData.user.id,
                avatarUrl: uploadData.publicUrl,
              }),
            });
          }
        } catch (uploadError) {
          console.error("Error uploading avatar:", uploadError);
          // Continua mesmo se houver erro no upload do avatar
        }
      }

      // Redireciona para página de verificação
      window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={step === 1 ? handleNext : handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Echo88</span>
            </Link>
            <h1 className="text-xl font-bold">Bem-vindo ao Echo88</h1>
            <FieldDescription>
              Já tem uma conta?{" "}
              <Link href="/login" className="underline hover:text-foreground">
                Fazer login
              </Link>
            </FieldDescription>
          </div>

          {step === 1 ? (
            <>
              <Field>
                <FieldLabel>Avatar</FieldLabel>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="size-24 rounded-full object-cover border-2 border-input"
                      />
                    ) : (
                      <div className="size-24 rounded-full border-2 border-dashed border-input flex items-center justify-center">
                        <User className="size-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="size-4" />
                    Escolher Avatar
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className={cn(
                    usernameStatus.checking && "border-muted-foreground/50",
                    usernameStatus.available === true &&
                      "border-2 border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500",
                    usernameStatus.available === false &&
                      "border-2 border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                  )}
                />
                {usernameStatus.checking && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Verificando...
                  </p>
                )}
                {usernameStatus.available === true && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {usernameStatus.message || "Username disponível"}
                  </p>
                )}
                {usernameStatus.available === false && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {usernameStatus.message || "Username não disponível"}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="fullName">Nome Completo</FieldLabel>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button type="submit" className="w-full">
                  Próximo
                </Button>
              </Field>
            </>
          ) : (
            <>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    emailStatus.checking && "border-muted-foreground/50",
                    emailStatus.available === true &&
                      "border-2 border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500",
                    emailStatus.available === false &&
                      "border-2 border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                  )}
                />
                {emailStatus.checking && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Verificando...
                  </p>
                )}
                {emailStatus.available === true && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {emailStatus.message || "Email disponível"}
                  </p>
                )}
                {emailStatus.available === false && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {emailStatus.message || "Email não disponível"}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirmação de Senha
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
              <Field className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Voltar
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Cadastrar"}
                </Button>
              </Field>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {passwordErrors.length > 0 && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm font-semibold text-destructive mb-2">
                    A senha deve atender aos seguintes requisitos:
                  </p>
                  <ul className="text-sm text-destructive/80 space-y-1 list-disc list-inside">
                    {passwordErrors.map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Ao continuar, você concorda com nossos{" "}
        <a href="#" className="underline hover:text-foreground">
          Termos de Serviço
        </a>{" "}
        e{" "}
        <a href="#" className="underline hover:text-foreground">
          Política de Privacidade
        </a>
        .
      </FieldDescription>
    </div>
  );
}
