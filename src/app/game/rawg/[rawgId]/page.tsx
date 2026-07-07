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
import { ArrowLeft, Loader2, ExternalLink, Gamepad2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RAWGGamePage() {
  const { rawgId } = useParams();
  const router = useRouter();
  const { user, initialized } = useAuthStore();
  const { games } = useGameStore();
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const inCollection = games.find((g) => g.rawgId === String(rawgId));

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login');
    }
  }, [initialized, user, router]);

  useEffect(() => {
    async function fetchGame() {
      try {
        const res = await fetch(`/api/search?rawgId=${rawgId}`);
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
  }, [rawgId]);

  if (!initialized || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
          <Gamepad2 className="h-12 w-12 text-slate-600" />
        </div>
        <p className="text-slate-400 text-lg font-medium">Game not found on RAWG</p>
        <Link href="/search">
          <Button variant="outline" className="mt-4 border-white/[0.08] text-slate-300 hover:bg-white/[0.04]">
            Back to Search
          </Button>
        </Link>
      </div>
    );
  }

  const genres = gameData.genres?.map((g: any) => g.name) || [];
  const platforms = gameData.platforms?.map((p: any) => p.platform?.name || p.name) || [];
  const developer = gameData.developers?.[0]?.name;
  const publisher = gameData.publishers?.[0]?.name;

  const searchResult: SearchResult = {
    id: `rawg-${gameData.id}`,
    title: gameData.name,
    coverUrl: gameData.background_image || undefined,
    description: gameData.description_raw || gameData.description,
    developer,
    publisher,
    releaseDate: gameData.released || undefined,
    genres,
    platforms,
    dataSource: DataSource.rawg,
    rawgId: String(gameData.id),
    rating: gameData.rating || undefined,
  };

  if (inCollection) {
    router.replace(`/game/${inCollection.id}`);
    return null;
  }

  return (
    <div className="space-y-6">
      {gameData.background_image && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src={gameData.background_image}
            alt=""
            fill
            className="object-cover object-top opacity-[0.08] blur-3xl scale-110"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/50 to-[#0a0a12]" />
        </div>
      )}

      <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white hover:bg-white/[0.04] rounded-xl">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative w-48 h-64 shrink-0 overflow-hidden rounded-xl mx-auto md:mx-0 shadow-2xl shadow-black/50">
          {gameData.background_image ? (
            <Image src={gameData.background_image} alt={gameData.name} fill className="object-cover" sizes="192px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/10 to-blue-600/10">
              <span className="text-6xl opacity-30">🎮</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-white">{gameData.name}</h1>
            <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 shrink-0 font-semibold">
              RAWG
            </Badge>
          </div>

          {(developer || publisher || gameData.released) && (
            <div className="flex flex-wrap gap-4 text-sm">
              {developer && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Developer:</span> <span className="text-slate-200">{developer}</span>
                </p>
              )}
              {publisher && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Publisher:</span> <span className="text-slate-200">{publisher}</span>
                </p>
              )}
              {gameData.released && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Released:</span> <span className="text-slate-200">{new Date(gameData.released).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          )}

          {gameData.rating && (
            <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/20 w-fit">
              <span className="text-amber-400">⭐</span>
              <span className="text-sm font-medium text-amber-300">{gameData.rating.toFixed(1)}/5</span>
              {gameData.ratings_count && <span className="text-xs text-amber-400/60 ml-1">({gameData.ratings_count} votes)</span>}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {genres.map((genre: string) => (
              <Badge key={genre} variant="secondary" className="bg-white/[0.04] text-slate-300 border-white/[0.06] border">
                {genre}
              </Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {platforms.map((platform: string) => (
              <Badge key={platform} variant="outline" className="border-white/[0.08] text-slate-400 text-xs">
                {platform}
              </Badge>
            ))}
          </div>

          <AddGameDialog game={searchResult} />
        </div>
      </div>

      {(gameData.description_raw || gameData.description) && (
        <Card className="border-white/[0.06] bg-white/[0.03] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-white">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {gameData.description_raw || gameData.description?.replace(/<[^>]*>/g, '')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <ExternalLink className="h-4 w-4 text-slate-400" />
        <a
          href={gameData.website || `https://rawg.io/games/${gameData.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
        >
          View on RAWG
        </a>
      </div>
    </div>
  );
}