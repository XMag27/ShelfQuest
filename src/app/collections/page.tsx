'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { type Collection } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FolderOpen, Plus, Trash2, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CollectionsPage() {
  const { user, initialized } = useAuthStore();
  const { collections, games, addCollection, deleteCollection } = useGameStore();
  const router = useRouter();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }
    setSaving(true);
    try {
      await addCollection(user.uid, {
        userId: user.uid,
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        gameIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success('Collection created!');
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (collectionId: string) => {
    try {
      await deleteCollection(user.uid, collectionId);
      toast.success('Collection deleted');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Collections</h1>
          <p className="text-slate-400 mt-1">Organize your games into custom collections</p>
        </div>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger render={<Button className="bg-purple-600 hover:bg-purple-700 text-white" />}>
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-purple-500/20 text-slate-100">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Create Collection</DialogTitle>
              <DialogDescription className="text-slate-400">Create a new collection to organize your games.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Name</label>
                <Input
                  placeholder="e.g., Best RPGs"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border-slate-700 bg-slate-800 text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Description</label>
                <Textarea
                  placeholder="What's this collection about?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border-slate-700 bg-slate-800 text-slate-100 min-h-[80px]"
                />
              </div>
              <Button
                onClick={handleCreate}
                disabled={saving}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {saving ? 'Creating...' : 'Create Collection'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="h-16 w-16 mx-auto text-slate-600 mb-4" />
          <h2 className="text-2xl font-bold text-slate-300 mb-2">No collections yet</h2>
          <p className="text-slate-500 mb-6">Create your first collection to organize your games</p>
          <Button onClick={() => setShowCreate(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => {
            const collectionGames = games.filter((g) => collection.gameIds.includes(g.id));
            return (
              <Card key={collection.id} className="border-purple-500/10 bg-slate-900/80 hover:border-purple-500/40 transition-all group">
                <Link href={`/collection/${collection.id}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-slate-100 flex items-center justify-between">
                      {collection.name}
                      <span className="text-sm font-normal text-slate-400">
                        {collection.gameIds.length} game{collection.gameIds.length !== 1 ? 's' : ''}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {collection.description && (
                      <p className="text-sm text-slate-400 mb-3 line-clamp-2">{collection.description}</p>
                    )}
                    {collectionGames.length > 0 ? (
                      <div className="flex -space-x-2">
                        {collectionGames.slice(0, 5).map((game) => (
                          <div key={game.id} className="relative h-10 w-8 rounded overflow-hidden border-2 border-slate-900">
                            {game.coverUrl ? (
                              <img src={game.coverUrl} alt={game.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-slate-800">
                                <span className="text-xs">🎮</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {collectionGames.length > 5 && (
                          <div className="flex h-10 w-8 items-center justify-center rounded bg-slate-800 border-2 border-slate-900 text-xs text-slate-400">
                            +{collectionGames.length - 5}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No games yet</p>
                    )}
                  </CardContent>
                </Link>
                <div className="px-4 pb-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(collection.id);
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}