"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Folder01Icon } from "@hugeicons/core-free-icons";
import { collectionsApi } from "@/lib/api/collections";
import type { Collection } from "@/lib/types/collection";
import { cn } from "@/lib/utils";
import { useToast } from "@/contexts/toast-context";

export interface CollectionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onPostAdded?: () => void;
}

export function CollectionSelectorModal({
  isOpen,
  onClose,
  postId,
  onPostAdded,
}: CollectionSelectorModalProps) {
  const { success, error: showError } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCollections();
    }
  }, [isOpen]);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const data = await collectionsApi.list();
      setCollections(data.collections || []);
    } catch (error) {
      console.error("Error loading collections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    try {
      await collectionsApi.addPost(collectionId, postId);
      onPostAdded?.();
      success("Post adicionado!", "O post foi adicionado à coleção");
      onClose();
    } catch (error) {
      console.error("Error adding post to collection:", error);
      showError("Erro ao adicionar post", "Não foi possível adicionar o post à coleção");
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    setIsCreating(true);
    try {
      const data = await collectionsApi.create({
        name: newCollectionName.trim(),
        is_public: false,
      });
      setCollections((prev) => [data.collection, ...prev]);
      setNewCollectionName("");
      setShowCreateForm(false);
      success("Coleção criada!", "A coleção foi criada com sucesso");
    } catch (error) {
      console.error("Error creating collection:", error);
      showError("Erro ao criar coleção", "Não foi possível criar a coleção");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Salvar em coleção</DialogTitle>
          <DialogDescription>
            Escolha uma coleção ou crie uma nova
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {showCreateForm ? (
            <div className="space-y-2 p-3 border rounded-lg">
              <Input
                placeholder="Nome da coleção"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateCollection();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim() || isCreating}
                  size="sm"
                  className="flex-1"
                >
                  Criar
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewCollectionName("");
                  }}
                  variant="outline"
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="w-full justify-start"
            >
              <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
              Criar nova coleção
            </Button>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando coleções...
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma coleção criada ainda
            </div>
          ) : (
            collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => handleAddToCollection(collection.id)}
                className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <HugeiconsIcon
                      icon={Folder01Icon}
                      className="size-5 text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{collection.name}</p>
                    {collection.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {collection.description}
                      </p>
                    )}
                    {collection.postsCount !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {collection.postsCount} post
                        {collection.postsCount !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

