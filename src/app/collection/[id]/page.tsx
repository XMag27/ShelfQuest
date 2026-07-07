'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { GameGrid } from '@/components/game/game-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Trash2, FolderOpen } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="h-12 w-12 text-slate-600" />
        </div>
        <p className="text-slate-400 text-lg font-medium">Collection not found</p>
        <Link href="/collections">
          <Button variant="outline" className="mt-4 border-white/[0.08] text-slate-300 hover:bg-white/[0.04]">
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
      <Button variant="ghost" onClick={() => router.push('/collections')} className="text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Collections
      </Button>

      {editing ? (
        <div className="space-y-4 max-w-lg">
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border-white/[0.08] bg-white/[0.04] text-white text-2xl font-bold placeholder:text-slate-500 focus:border-violet-500/40"
            placeholder="Collection name"
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="border-white/[0.08] bg-white/[0.04] text-slate-100 placeholder:text-slate-500 focus:border-violet-500/40"
            placeholder="Description (optional)"
          />
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20">
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="border-white/[0.08] text-slate-400 hover:bg-white/[0.04]">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{collection.name}</h1>
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
              className="border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {collectionGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl opacity-30">🎮</span>
          </div>
          <p className="text-slate-400 font-medium">No games in this collection yet</p>
          <Link href="/library">
            <Button variant="outline" className="mt-4 border-white/[0.08] text-slate-300 hover:bg-white/[0.04]">
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