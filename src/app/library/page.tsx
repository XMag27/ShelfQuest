'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore, useFilteredGames } from '@/stores/game-store';
import { PlayStatus, GamePlatform, playStatusLabelMap, platformLabelMap } from '@/types';
import { GameGrid } from '@/components/game/game-grid';
import { GameListItem } from '@/components/game/game-list-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, List, Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export default function LibraryPage() {
  const { user, initialized } = useAuthStore();
  const { filterStatus, filterPlatform, viewMode, sortBy, sortOrder, searchQuery,
    setFilterStatus, setFilterPlatform, setViewMode, setSortBy, setSortOrder, setSearchQuery,
    loading } = useGameStore();
  const filteredGames = useFilteredGames();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  // Read URL params on mount (e.g. ?status=playing)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get('status');
    if (statusParam && Object.values(PlayStatus).includes(statusParam as PlayStatus)) {
      setFilterStatus(statusParam as PlayStatus);
    }
  }, [setFilterStatus]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Library</h1>
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 rounded-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-lg'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 rounded-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] rounded-lg'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Filter games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-white/[0.06] bg-white/[0.04] text-slate-100 placeholder:text-slate-500 focus:border-violet-500/40 focus:bg-white/[0.06]"
          />
        </div>

        <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? null : (v as PlayStatus))}>
          <SelectTrigger className="w-[160px] border-white/[0.06] bg-white/[0.04] text-slate-100 focus:border-violet-500/40">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl border-white/[0.08]">
            <SelectItem value="all" className="text-slate-200 focus:bg-white/[0.04]">All Statuses</SelectItem>
            {Object.entries(playStatusLabelMap).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-slate-200 focus:bg-white/[0.04]">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPlatform || 'all'} onValueChange={(v) => setFilterPlatform(v === 'all' ? null : (v as GamePlatform))}>
          <SelectTrigger className="w-[160px] border-white/[0.06] bg-white/[0.04] text-slate-100 focus:border-violet-500/40">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl border-white/[0.08]">
            <SelectItem value="all" className="text-slate-200 focus:bg-white/[0.04]">All Platforms</SelectItem>
            {Object.entries(platformLabelMap).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-slate-200 focus:bg-white/[0.04]">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[150px] border-white/[0.06] bg-white/[0.04] text-slate-100 focus:border-violet-500/40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a2e]/95 backdrop-blur-xl border-white/[0.08]">
            <SelectItem value="dateAdded" className="text-slate-200 focus:bg-white/[0.04]">Date Added</SelectItem>
            <SelectItem value="title" className="text-slate-200 focus:bg-white/[0.04]">Title</SelectItem>
            <SelectItem value="rating" className="text-slate-200 focus:bg-white/[0.04]">Rating</SelectItem>
            <SelectItem value="hoursPlayed" className="text-slate-200 focus:bg-white/[0.04]">Hours Played</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="border-white/[0.06] bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.06]"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-500">
        Showing <span className="text-slate-300 font-medium">{filteredGames.length}</span> game{filteredGames.length !== 1 ? 's' : ''}
      </p>

      {/* Games display */}
      {viewMode === 'grid' ? (
        <GameGrid games={filteredGames} loading={loading} />
      ) : (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <span className="text-4xl opacity-30">🎮</span>
              </div>
              <p className="text-lg text-slate-400 font-medium">No games found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredGames.map((game) => <GameListItem key={game.id} game={game} />)
          )}
        </div>
      )}
    </div>
  );
}