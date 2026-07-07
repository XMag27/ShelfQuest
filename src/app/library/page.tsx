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
import { LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react';

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-100">My Library</h1>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700 text-slate-400'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-purple-600 hover:bg-purple-700' : 'border-slate-700 text-slate-400'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Filter games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-slate-700 bg-slate-800/80 text-slate-100 placeholder:text-slate-500"
          />
        </div>

        <Select value={filterStatus || 'all'} onValueChange={(v) => setFilterStatus(v === 'all' ? null : (v as PlayStatus))}>
          <SelectTrigger className="w-[160px] border-slate-700 bg-slate-800/80 text-slate-100">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-slate-400" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-slate-200 focus:bg-slate-700">All Statuses</SelectItem>
            {Object.entries(playStatusLabelMap).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-slate-200 focus:bg-slate-700">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPlatform || 'all'} onValueChange={(v) => setFilterPlatform(v === 'all' ? null : (v as GamePlatform))}>
          <SelectTrigger className="w-[160px] border-slate-700 bg-slate-800/80 text-slate-100">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all" className="text-slate-200 focus:bg-slate-700">All Platforms</SelectItem>
            {Object.entries(platformLabelMap).map(([value, label]) => (
              <SelectItem key={value} value={value} className="text-slate-200 focus:bg-slate-700">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[150px] border-slate-700 bg-slate-800/80 text-slate-100">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="dateAdded" className="text-slate-200 focus:bg-slate-700">Date Added</SelectItem>
            <SelectItem value="title" className="text-slate-200 focus:bg-slate-700">Title</SelectItem>
            <SelectItem value="rating" className="text-slate-200 focus:bg-slate-700">Rating</SelectItem>
            <SelectItem value="hoursPlayed" className="text-slate-200 focus:bg-slate-700">Hours Played</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="border-slate-700 text-slate-400 hover:text-slate-200"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-400">
        Showing {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
      </p>

      {/* Games display */}
      {viewMode === 'grid' ? (
        <GameGrid games={filteredGames} loading={loading} />
      ) : (
        <div className="space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <p className="text-lg">No games found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredGames.map((game) => <GameListItem key={game.id} game={game} />)
          )}
        </div>
      )}
    </div>
  );
}