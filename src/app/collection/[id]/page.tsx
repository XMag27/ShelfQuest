'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { GameGrid } from '@/components/game/game-grid';
import { GameListItem } from '@/components/game/game-list-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CollectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { collections, games, updateCollection, deleteCollection } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const collection = collections.find((c) => c.id === id);
  const collectionGames = collection
    ? games.filter((g) => collection.gameIds.includes(g.id))
    : [];

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (collection) {
      setEditName(collection.name);
      setEditDescription(collection.description || '');
    }
  }, [collection]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg">Collection not found</p>
        <Link href="/collections">
          <Button variant="outline" className="mt-4 border-purple-500/30 text-purple-300">
            Back to Collections
          </Button>
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Collection name is required');
      return;
    }
    setSaving(true);
    try {
      await updateCollection(user.uid, collection.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Collection updated!');
      setEditing(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this collection?')) return;
    try {
      await deleteCollection(user.uid, collection.id);
      toast.success('Collection deleted');
      router.push('/collections');
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/collections')} className="text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collections
      </Button>

      {editing ? (
        <div className="space-y-4 max-w-lg">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border-slate-700 bg-slate-800 text-slate-100 text-2xl font-bold"
            placeholder="Collection name"
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="border-slate-700 bg-slate-800 text-slate-100"
            placeholder="Description (optional)"
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="border-slate-700 text-slate-400">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{collection.name}</h1>
            {collection.description && (
              <p className="text-slate-400 mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-slate-500 mt-2">
              {collectionGames.length} game{collectionGames.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setEditing(true)}
              className="border-slate-700 text-slate-400 hover:text-slate-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {collectionGames.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400">No games in this collection yet</p>
          <Link href="/library">
            <Button variant="outline" className="mt-4 border-purple-500/30 text-purple-300">
              Browse Library
            </Button>
          </Link>
        </div>
      ) : (
        <GameGrid games={collectionGames} />
      )}
    </div>
  );
}