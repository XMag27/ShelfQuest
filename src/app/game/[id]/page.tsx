'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { type Game, PlayStatus, CompletionStatus, GamePlatform, playStatusLabelMap, completionStatusLabelMap, platformLabelMap, platformIconMap } from '@/types';
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
import { ArrowLeft, Star, Clock, Trash2, Edit, Gamepad2 } from 'lucide-react';
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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <Gamepad2 className="h-12 w-12 text-slate-600" />
        </div>
        <p className="text-slate-400 text-lg font-medium">Game not found</p>
        <Link href="/library">
          <Button variant="outline" className="mt-4 border-white/[0.08] text-slate-300 hover:bg-white/[0.04]">
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
      {/* Hero section with blurred cover background */}
      {game.coverUrl && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={game.coverUrl}
            alt=""
            fill
            className="object-cover object-top opacity-[0.08] blur-3xl scale-110"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/50 to-[#0a0a12]" />
        </div>
      )}

      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Game header */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="relative w-48 h-64 shrink-0 overflow-hidden rounded-xl mx-auto md:mx-0 shadow-2xl shadow-black/50">
          {game.coverUrl ? (
            <Image src={game.coverUrl} alt={game.title} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-600/10">
              <span className="text-6xl opacity-30">🎮</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">{game.title}</h1>
            <div className="flex gap-2 shrink-0">
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
                onClick={() => setDeleting(true)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={game.playStatus} />
            <StatusBadge status={game.completionStatus} />
            {game.genres.map((genre) => (
              <Badge key={genre} variant="secondary" className="bg-white/[0.04] text-slate-300 border-white/[0.06] border">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
            {game.platforms.map((p) => (
              <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                {platformIconMap[p]} {platformLabelMap[p]}
              </span>
            ))}
          </div>

          {game.personalRating > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 w-fit">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="text-lg font-bold text-amber-300">{game.personalRating}/10</span>
            </div>
          )}

          {game.hoursPlayed > 0 && (
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="h-4 w-4 text-violet-400" />
              <span className="font-medium">{game.hoursPlayed} hours played</span>
            </div>
          )}

          {(game.developer || game.releaseDate) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {game.developer && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Developer:</span> <span className="text-slate-200">{game.developer}</span>
                </p>
              )}
              {game.releaseDate && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Released:</span> <span className="text-slate-200">{new Date(game.releaseDate).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          )}

          {game.notes && (
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{game.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {game.description && (
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{game.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-[#12122a]/95 backdrop-blur-xl border-white/[0.08] text-slate-100 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Edit {game.title}</DialogTitle>
            <DialogDescription className="text-slate-400">Update your game tracking details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Play Status</Label>
              <Select value={editPlayStatus} onValueChange={(v) => setEditPlayStatus(v as PlayStatus)}>
                <SelectTrigger className="border-white/[0.08] bg-white/[0.04] text-slate-100 focus:border-violet-500/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl border-white/[0.08]">
                  {Object.entries(playStatusLabelMap).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-slate-200 focus:bg-white/[0.04]">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Completion Status</Label>
              <Select value={editCompletionStatus} onValueChange={(v) => setEditCompletionStatus(v as CompletionStatus)}>
                <SelectTrigger className="border-white/[0.08] bg-white/[0.04] text-slate-100 focus:border-violet-500/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl border-white/[0.08]">
                  {Object.entries(completionStatusLabelMap).map(([value, label]) => (
                    <SelectItem key={value} value={value} className="text-slate-200 focus:bg-white/[0.04]">{label}</SelectItem>
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
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0'
                      : 'border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.06]'}
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
                className="border-white/[0.08] bg-white/[0.04] text-slate-100 focus:border-violet-500/40"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Hours Played</Label>
              <Input
                type="number"
                min={0}
                value={editHours}
                onChange={(e) => setEditHours(Math.max(0, Number(e.target.value)))}
                className="border-white/[0.08] bg-white/[0.04] text-slate-100 focus:border-violet-500/40"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Notes</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="border-white/[0.08] bg-white/[0.04] text-slate-100 focus:border-violet-500/40 min-h-[80px]"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-violet-500/20">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="border-white/[0.08] text-slate-400 hover:bg-white/[0.04]">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleting} onOpenChange={setDeleting}>
        <DialogContent className="bg-[#12122a]/95 backdrop-blur-xl border-red-500/20 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete {game.title}?</DialogTitle>
            <DialogDescription className="text-slate-400">
              This will remove the game from your collection. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-600 hover:bg-red-500 text-white border-0">
              {saving ? 'Deleting...' : 'Delete'}
            </Button>
            <Button variant="outline" onClick={() => setDeleting(false)} className="border-white/[0.08] text-slate-400 hover:bg-white/[0.04]">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}