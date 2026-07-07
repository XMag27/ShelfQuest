'use client';

import { useState } from 'react';
import {
  PlayStatus,
  CompletionStatus,
  GamePlatform,
  type Game,
  type SearchResult,
  playStatusLabelMap,
  completionStatusLabelMap,
  platformLabelMap,
} from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface AddGameDialogProps {
  game?: SearchResult;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddGameDialog({ game, children, open: controlledOpen, onOpenChange }: AddGameDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const { user } = useAuthStore();
  const { addGame } = useGameStore();

  const [playStatus, setPlayStatus] = useState<PlayStatus>(PlayStatus.backlog);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>(CompletionStatus.mainStory);
  const [platforms, setPlatforms] = useState<GamePlatform[]>(game?.platforms
    ? (Object.values(GamePlatform) as GamePlatform[]).filter(p =>
        game.platforms.some(gp => gp.toLowerCase().includes(p.replace('_', '')))
      )
    : []);
  const [personalRating, setPersonalRating] = useState(0);
  const [hoursPlayed, setHoursPlayed] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePlatformToggle = (platform: GamePlatform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to add games');
      return;
    }
    if (platforms.length === 0) {
      toast.error('Please select at least one platform');
      return;
    }

    setSaving(true);
    try {
      const newGame: Omit<Game, 'id'> = {
        title: game?.title || '',
        coverUrl: game?.coverUrl,
        description: game?.description,
        developer: game?.developer,
        genres: game?.genres || [],
        platforms,
        playStatus,
        completionStatus,
        personalRating,
        hoursPlayed,
        notes: notes || undefined,
        dateAdded: new Date().toISOString(),
        dataSource: game?.dataSource,
        igdbId: game?.igdbId,
        rawgId: game?.rawgId,
      };

      await addGame(user.uid, newGame);
      toast.success(`${newGame.title} added to your collection!`);
      setOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-purple-600 hover:bg-purple-700 text-white" />}>
        <Plus className="h-4 w-4 mr-2" />
        Add to Collection
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-purple-500/20 text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            Add {game?.title || 'Game'} to Collection
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Choose how you want to track this game.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Play Status */}
          <div className="space-y-2">
            <Label className="text-slate-300">Play Status</Label>
            <Select value={playStatus} onValueChange={(v) => setPlayStatus(v as PlayStatus)}>
              <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {Object.entries(playStatusLabelMap).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-slate-200 focus:bg-slate-700">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Completion Status */}
          <div className="space-y-2">
            <Label className="text-slate-300">Completion Status</Label>
            <Select value={completionStatus} onValueChange={(v) => setCompletionStatus(v as CompletionStatus)}>
              <SelectTrigger className="border-slate-700 bg-slate-800 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {Object.entries(completionStatusLabelMap).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-slate-200 focus:bg-slate-700">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platforms */}
          <div className="space-y-2">
            <Label className="text-slate-300">Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(platformLabelMap).map(([value, label]) => (
                <Button
                  key={value}
                  type="button"
                  variant={platforms.includes(value as GamePlatform) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePlatformToggle(value as GamePlatform)}
                  className={
                    platforms.includes(value as GamePlatform)
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'border-slate-700 text-slate-400 hover:text-slate-200'
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Personal Rating */}
          <div className="space-y-2">
            <Label className="text-slate-300">Rating (0-10)</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={personalRating}
              onChange={(e) => setPersonalRating(Math.min(10, Math.max(0, Number(e.target.value))))}
              className="border-slate-700 bg-slate-800 text-slate-100"
            />
          </div>

          {/* Hours Played */}
          <div className="space-y-2">
            <Label className="text-slate-300">Hours Played</Label>
            <Input
              type="number"
              min={0}
              value={hoursPlayed}
              onChange={(e) => setHoursPlayed(Math.max(0, Number(e.target.value)))}
              className="border-slate-700 bg-slate-800 text-slate-100"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-slate-300">Notes</Label>
            <Textarea
              placeholder="Personal notes about this game..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border-slate-700 bg-slate-800 text-slate-100 min-h-[80px]"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saving ? 'Adding...' : 'Add to Collection'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}