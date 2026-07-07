'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { type Game, PlayStatus, CompletionStatus, GamePlatform, playStatusLabelMap, completionStatusLabelMap, platformLabelMap, platformIconMap, playStatusColorMap } from '@/types';
import { StatusBadge } from '@/components/game/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ArrowLeft, Star, Clock, Trash2, Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function GameDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { games, updateGame, deleteGame } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editPlayStatus, setEditPlayStatus] = useState<PlayStatus>(PlayStatus.backlog);
  const [editCompletionStatus, setEditCompletionStatus] = useState<CompletionStatus>(CompletionStatus.mainStory);
  const [editPlatforms, setEditPlatforms] = useState<GamePlatform[]>([]);
  const [editRating, setEditRating] = useState(0);
  const [editHours, setEditHours] = useState(0);
  const [editNotes, setEditNotes] = useState('');

  const game = games.find((g) => g.id === id);

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    if (game) {
      setEditPlayStatus(game.playStatus);
      setEditCompletionStatus(game.completionStatus);
      setEditPlatforms([...game.platforms]);
      setEditRating(game.personalRating);
      setEditHours(game.hoursPlayed);
      setEditNotes(game.notes || '');
    }
  }, [game]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg">Game not found</p>
        <Link href="/library">
          <Button variant="outline" className="mt-4 border-purple-500/30 text-purple-300">
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateGame(user.uid, game.id, {
        playStatus: editPlayStatus,
        completionStatus: editCompletionStatus,
        platforms: editPlatforms,
        personalRating: editRating,
        hoursPlayed: editHours,
        notes: editNotes || undefined,
      });
      toast.success('Game updated!');
      setEditing(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await deleteGame(user.uid, game.id);
      toast.success('Game removed from collection');
      router.push('/library');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePlatformToggle = (platform: GamePlatform) => {
    setEditPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-slate-400 hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Game header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="relative w-48 h-64 shrink-0 overflow-hidden rounded-lg mx-auto md:mx-0">
          {game.coverUrl ? (
            <Image src={game.coverUrl} alt={game.title} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <span className="text-6xl">🎮</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-slate-100">{game.title}</h1>
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
                onClick={() => setDeleting(true)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={game.playStatus} />
            <StatusBadge status={game.completionStatus} />
            {game.genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-slate-800 text-slate-300 border-0">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
            {game.platforms.map((p) => (
              <span key={p} className="flex items-center gap-1">
                {platformIconMap[p]} {platformLabelMap[p]}
              </span>
            ))}
          </div>

          {game.personalRating > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="h-5 w-5 fill-current" />
              <span className="text-lg font-semibold">{game.personalRating}/10</span>
            </div>
          )}

          {game.hoursPlayed > 0 && (
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>{game.hoursPlayed} hours played</span>
            </div>
          )}

          {game.developer && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-300">Developer:</span> {game.developer}
            </p>
          )}

          {game.releaseDate && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-300">Released:</span> {new Date(game.releaseDate).toLocaleDateString()}
            </p>
          )}

          {game.notes && (
            <Card className="border-slate-800 bg-slate-900/50">
              <CardContent className="p-3">
                <p className="text-sm text-slate-300 whitespace-pre-wrap">{game.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <Card className="border-purple-500/10 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{game.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-slate-900 border-purple-500/20 text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-slate-100">Edit {game.title}</DialogTitle>
            <DialogDescription className="text-slate-400">Update your game tracking details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Play Status</Label>
              <Select value={editPlayStatus} onValueChange={(v) => setEditPlayStatus(v as PlayStatus)}>
                <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(playStatusLabelMap).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-slate-200 focus:bg-slate-700">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Completion Status</Label>
              <Select value={editCompletionStatus} onValueChange={(v) => setEditCompletionStatus(v as CompletionStatus)}>
                <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {Object.entries(completionStatusLabelMap).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-slate-200 focus:bg-slate-700">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(platformLabelMap).map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={editPlatforms.includes(value as GamePlatform) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePlatformToggle(value as GamePlatform)}
                    className={editPlatforms.includes(value as GamePlatform)
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-slate-700 text-slate-400 hover:text-slate-200'}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Rating (0-10)</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={editRating}
                onChange={(e) => setEditRating(Math.min(10, Math.max(0, Number(e.target.value))))}
                className="border-slate-700 bg-slate-800 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Hours Played</Label>
              <Input
                type="number"
                min={0}
                value={editHours}
                onChange={(e) => setEditHours(Math.max(0, Number(e.target.value)))}
                className="border-slate-700 bg-slate-800 text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="border-slate-700 bg-slate-800 text-slate-100 min-h-[80px]"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="border-slate-700 text-slate-400">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent className="bg-slate-900 border-red-500/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete {game.title}?</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will remove the game from your collection. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="outline" onClick={() => setDeleting(false)} className="border-slate-700 text-slate-400">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}