'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useGameStore } from '@/stores/game-store';
import { type SearchResult, DataSource } from '@/types';
import { AddGameDialog } from '@/components/game/add-game-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function IGDBGamePage() {
  const { igdbId } = useParams();
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { games } = useGameStore();
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if game is already in collection
  const inCollection = games.find((g) => g.igdbId === String(igdbId));

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/search?igdbId=${igdbId}`);
        if (res.ok) {
          const data = await res.json();
          setGameData(data);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchGame();
  }, [igdbId]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg">Game not found on IGDB</p>
        <Link href="/search">
          <Button variant="outline" className="mt-4 border-purple-500/30 text-purple-300">
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const coverUrl = gameData.cover?.image_id
    ? `https://images.igdb.com/igdb/image/upload/cover_big/${gameData.cover.image_id}.jpg`
    : gameData.coverUrl;

  const developer = gameData.involved_companies?.find((c: any) => c.developer)?.company?.name;
  const publisher = gameData.involved_companies?.find((c: any) => c.publisher)?.company?.name;
  const genres = gameData.genres?.map((g: any) => g.name) || [];
  const platforms = gameData.platforms?.map((p: any) => p.name) || [];
  const releaseDate = gameData.first_release_date
    ? new Date(gameData.first_release_date * 1000).toLocaleDateString()
    : null;

  const searchResult: SearchResult = {
    id: `igdb-${gameData.id}`,
    title: gameData.name,
    coverUrl: coverUrl || undefined,
    description: gameData.summary || gameData.storyline,
    developer,
    publisher,
    releaseDate: gameData.first_release_date
      ? new Date(gameData.first_release_date * 1000).toISOString()
      : undefined,
    genres,
    platforms,
    dataSource: DataSource.igdb,
    igdbId: String(gameData.id),
    rating: gameData.rating ? gameData.rating / 10 : undefined,
  };

  // If already in collection, redirect to game detail page
  if (inCollection) {
    router.replace(`/game/${inCollection.id}`);
    return null;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-slate-200">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Cover */}
        <div className="relative w-48 h-64 shrink-0 overflow-hidden rounded-lg mx-auto md:mx-0">
          {coverUrl ? (
            <Image src={coverUrl} alt={gameData.name} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800">
              <span className="text-6xl">🎮</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-slate-100">{gameData.name}</h1>
            <Badge variant="outline" className="border-purple-500/50 text-purple-300 shrink-0">
              IGDB
            </Badge>
          </div>

          {developer && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-300">Developer:</span> {developer}
            </p>
          )}
          {publisher && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-300">Publisher:</span> {publisher}
            </p>
          )}
          {releaseDate && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-300">Released:</span> {releaseDate}
            </p>
          )}
          {gameData.rating && (
            <p className="text-sm text-slate-400">
              <span className="text-slate-300">Rating:</span> ⭐ {(gameData.rating / 10).toFixed(1)}/10
              {gameData.rating_count && ` (${gameData.rating_count} votes)`}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {genres.map((genre: string) => (
              <Badge key={genre} variant="secondary" className="bg-slate-800 text-slate-300 border-0">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {platforms.map((platform: string) => (
              <Badge key={platform} variant="outline" className="border-slate-700 text-slate-400 text-xs">
                {platform}
              </Badge>
            ))}
          </div>

          <AddGameDialog game={searchResult} />
        </div>
      </div>

      {/* Description */}
      {(gameData.summary || gameData.storyline) && (
        <Card className="border-purple-500/10 bg-slate-900/80">
          <CardHeader>
            <CardTitle className="text-lg text-slate-200">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">
              {gameData.storyline || gameData.summary}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4 text-slate-400" />
        <a
          href={`https://www.igdb.com/games/${gameData.slug || gameData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-purple-400 hover:text-purple-300 underline"
        >
          View on IGDB
        </a>
      </div>
    </div>
  );
}