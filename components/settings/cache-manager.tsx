/**
 * Gerenciador de Cache
 * 
 * UI para visualizar e gerenciar cache
 */

"use client";

import { useState, useEffect } from "react";
import { useServiceWorker } from "@/lib/utils/service-worker";
import {
  getCacheMetrics,
  getMetricsByType,
  resetCacheMetrics,
  updateCacheSize,
} from "@/lib/utils/cache-metrics";
import { clearImageCache, getCacheStats } from "@/lib/utils/image-cache";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Trash2,
  RefreshCw,
  Database,
  Image as ImageIcon,
  HardDrive,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useToast } from "@/contexts/toast-context";
import { cn } from "@/lib/utils";

export function CacheManager() {
  const { clearCache, isSupported } = useServiceWorker();
  const { success, error: showError } = useToast();
  const [metrics, setMetrics] = useState(getCacheMetrics());
  const [imageStats, setImageStats] = useState<{
    memoryCount: number;
    dbCount: number;
    totalSize: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [metricsByType, setMetricsByType] = useState(getMetricsByType());

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Atualizar a cada 5s
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    setMetrics(getCacheMetrics());
    setMetricsByType(getMetricsByType());
    try {
      const stats = await getCacheStats();
      setImageStats(stats);
      await updateCacheSize();
    } catch (err) {
      console.warn("Erro ao carregar stats:", err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Tem certeza que deseja limpar todo o cache?")) return;

    setIsLoading(true);
    try {
      await clearCache();
      await clearImageCache();
      resetCacheMetrics();
      await loadStats();
      success("Cache limpo com sucesso");
    } catch (err) {
      showError("Erro ao limpar cache");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearImages = async () => {
    if (!confirm("Tem certeza que deseja limpar cache de imagens?")) return;

    setIsLoading(true);
    try {
      await clearImageCache();
      await loadStats();
      success("Cache de imagens limpo");
    } catch (err) {
      showError("Erro ao limpar cache de imagens");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const hitRate = metrics.totalRequests > 0 
    ? (metrics.hitRate * 100).toFixed(1) 
    : "0.0";

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Cache</CardTitle>
          <CardDescription>
            Service Worker não suportado neste navegador
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="size-5" />
            Estatísticas de Cache
          </CardTitle>
          <CardDescription>
            Métricas de performance do cache
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Taxa de Acerto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Taxa de Acerto</span>
              <span className="text-sm text-muted-foreground">{hitRate}%</span>
            </div>
            <Progress value={metrics.hitRate * 100} className="h-2" />
          </div>

          {/* Requisições */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="size-4" />
                Cache Hits
              </div>
              <div className="text-2xl font-bold text-green-600">
                {metrics.hits.toLocaleString()}
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                Cache Misses
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.misses.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Total e Tempo Médio */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <div className="text-xs text-muted-foreground">Total de Requisições</div>
              <div className="text-lg font-semibold">
                {metrics.totalRequests.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Tempo Médio</div>
              <div className="text-lg font-semibold">
                {metrics.averageResponseTime.toFixed(0)}ms
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas por Tipo</CardTitle>
          <CardDescription>
            Performance do cache por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(metricsByType).map(([type, stats]) => (
            <div key={type} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize font-medium">{type}</span>
                <span className="text-muted-foreground">
                  {(stats.hitRate * 100).toFixed(1)}% hit rate
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{stats.hits} hits</span>
                <span>•</span>
                <span>{stats.misses} misses</span>
                <span>•</span>
                <span>{stats.total} total</span>
              </div>
              <Progress value={stats.hitRate * 100} className="h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cache de Imagens */}
      {imageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="size-5" />
              Cache de Imagens
            </CardTitle>
            <CardDescription>
              Estatísticas do cache de imagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Memória</div>
                <div className="text-lg font-semibold">
                  {imageStats.memoryCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">IndexedDB</div>
                <div className="text-lg font-semibold">
                  {imageStats.dbCount}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tamanho Total</div>
                <div className="text-lg font-semibold">
                  {formatBytes(imageStats.totalSize)}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearImages}
              disabled={isLoading}
              className="w-full"
            >
              <Trash2 className="size-4 mr-2" />
              Limpar Cache de Imagens
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="size-5" />
            Ações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            onClick={loadStats}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={cn("size-4 mr-2", isLoading && "animate-spin")} />
            Atualizar Estatísticas
          </Button>
          <Button
            variant="destructive"
            onClick={handleClearAll}
            disabled={isLoading}
            className="w-full"
          >
            <Trash2 className="size-4 mr-2" />
            Limpar Todo o Cache
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

