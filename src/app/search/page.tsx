'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { SearchBar } from '@/components/search/search-bar';
import { type SearchResult, DataSource } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Search as SearchIcon, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchPage() {
  const { user, initialized } = useAuthStore();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query || query.length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handlePopular = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch('/api/search?popular=true');
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (initialized && !user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Search Games</h1>
        <p className="text-slate-400 mt-1">Search across IGDB and RAWG databases</p>
      </div>

      <div className="max-w-2xl">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={handlePopular}
          disabled={loading}
          className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50 bg-white/[0.02]"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Popular Games
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-500 border-t-transparent" />
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-violet-400" />
            </div>
            <p className="text-slate-400 text-sm">Searching databases...</p>
          </div>
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-lg text-slate-300 font-medium">No results found</p>
          <p className="text-sm text-slate-500 mt-1">Try a different search term</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {results.map((result) => {
            const href = result.dataSource === DataSource.igdb && result.igdbId
              ? `/game/igdb/${result.igdbId}`
              : result.dataSource === DataSource.rawg && result.rawgId
              ? `/game/rawg/${result.rawgId}`
              : '#';

            return (
              <Link key={result.id} href={href} className="group block">
                <div className="game-card-hover relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {result.coverUrl ? (
                      <>
                        <Image
                          src={result.coverUrl}
                          alt={result.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/40 to-transparent" />
                      </>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-500/10 to-indigo-600/10">
                        <span className="text-4xl opacity-30">🎮</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold backdrop-blur-sm ${
                          result.dataSource === DataSource.igdb
                            ? 'border-violet-500/40 text-violet-300 bg-violet-500/20'
                            : 'border-cyan-500/40 text-cyan-300 bg-cyan-500/20'
                        }`}
                      >
                        {result.dataSource === DataSource.igdb ? 'IGDB' : 'RAWG'}
                      </Badge>
                    </div>
                    {result.rating !== undefined && result.rating > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/50 backdrop-blur-sm border border-amber-500/30 text-amber-300">
                          ⭐ {result.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                    {/* Title overlay */}
                    {result.coverUrl && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                        <h3 className="font-semibold text-sm text-white truncate drop-shadow-lg">{result.title}</h3>
                      </div>
                    )}
                  </div>
                  {!result.coverUrl && (
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-white truncate">{result.title}</h3>
                    </div>
                  )}
                  {(result.developer || result.genres.length > 0) && (
                    <div className="px-3 pb-3">
                      {result.developer && (
                        <p className="text-xs text-slate-400 truncate">{result.developer}</p>
                      )}
                      {result.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {result.genres.slice(0, 3).map((genre) => (
                            <Badge key={genre} variant="secondary" className="text-[10px] bg-white/[0.04] text-slate-400 border-white/[0.06] border">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}