/**
 * Error Boundary Component
 * 
 * Componente para capturar e tratar erros em componentes React
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, RefreshIcon } from "@hugeicons/core-free-icons";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary para capturar erros em componentes filhos
 */
export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro
    console.error("[ErrorBoundary] Erro capturado:", error, errorInfo);

    // Atualizar estado
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Chamar callback de erro se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar erro para serviço de monitoramento (opcional)
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Exemplo: enviar para Sentry, LogRocket, etc.
      this.reportError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Resetar se resetKeys mudaram
    if (hasError && resetKeys && resetKeys.length > 0) {
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== prevProps.resetKeys?.[index]
      );

      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }

    // Resetar se props mudaram e resetOnPropsChange está habilitado
    if (hasError && resetOnPropsChange) {
      const hasPropsChanged = Object.keys(this.props).some(
        (key) =>
          key !== "children" &&
          key !== "fallback" &&
          key !== "onError" &&
          key !== "resetKeys" &&
          key !== "resetOnPropsChange" &&
          this.props[key as keyof Props] !== prevProps[key as keyof Props]
      );

      if (hasPropsChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Exemplo de integração com serviço de monitoramento
      // if (window.Sentry) {
      //   window.Sentry.captureException(error, {
      //     contexts: {
      //       react: {
      //         componentStack: errorInfo.componentStack,
      //       },
      //     },
      //   });
      // }

      // Log local em produção
      if (typeof window !== "undefined") {
        const errorData = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        };

        // Armazenar no localStorage para debug (limitado a 10 erros)
        try {
          const storedErrors = JSON.parse(
            localStorage.getItem("errorLog") || "[]"
          );
          storedErrors.unshift(errorData);
          if (storedErrors.length > 10) {
            storedErrors.pop();
          }
          localStorage.setItem("errorLog", JSON.stringify(storedErrors));
        } catch {
          // Ignorar erros de localStorage
        }
      }
    } catch (reportError) {
      console.error("[ErrorBoundary] Erro ao reportar erro:", reportError);
    }
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReset = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      // Renderizar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderizar UI de erro padrão
      const { error, errorInfo, errorCount } = this.state;
      const isDevelopment = process.env.NODE_ENV === "development";

      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    className="size-6 text-destructive"
                  />
                </div>
                <div>
                  <CardTitle>Algo deu errado</CardTitle>
                  <CardDescription>
                    Ocorreu um erro inesperado. Por favor, tente novamente.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDevelopment && error && (
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-mono text-sm text-destructive">
                    {error.toString()}
                  </p>
                  {errorInfo?.componentStack && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                        Stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                        {errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {errorCount > 1 && (
                <p className="text-sm text-muted-foreground">
                  Este erro ocorreu {errorCount} vez(es). Tente recarregar a página.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleReset} variant="outline" className="flex-1">
                  <HugeiconsIcon icon={RefreshIcon} className="mr-2 size-4" />
                  Tentar novamente
                </Button>
                <Button onClick={this.handleReload} className="flex-1">
                  Recarregar página
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook para usar Error Boundary programaticamente
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error("[useErrorHandler] Erro:", error, errorInfo);
    
    // Em produção, reportar para serviço de monitoramento
    if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
      // Exemplo: window.Sentry?.captureException(error);
    }

    // Re-throw para que Error Boundary possa capturar
    throw error;
  };
}

/**
 * HOC para envolver componentes com Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
}

