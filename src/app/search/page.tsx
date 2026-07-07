'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { SearchBar } from '@/components/search/search-bar';
import { type SearchResult, DataSource } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp } from 'lucide-react';
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
        <h1 className="text-3xl font-bold text-slate-100">Search Games</h1>
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
          className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Popular Games
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400">No results found. Try a different search term.</p>
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
              <Link key={result.id} href={href}>
                <Card className="group overflow-hidden border-purple-500/10 bg-slate-900/80 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {result.coverUrl ? (
                      <Image
                        src={result.coverUrl}
                        alt={result.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-800">
                        <span className="text-4xl">🎮</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          result.dataSource === DataSource.igdb
                            ? 'border-purple-500/50 text-purple-300 bg-purple-900/50'
                            : 'border-blue-500/50 text-blue-300 bg-blue-900/50'
                        }`}
                      >
                        {result.dataSource === DataSource.igdb ? 'IGDB' : 'RAWG'}
                      </Badge>
                    </div>
                    {result.rating !== undefined && result.rating > 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="secondary" className="text-xs bg-slate-900/80 text-yellow-400 border-0">
                          ⭐ {result.rating.toFixed(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm text-slate-100 truncate">{result.title}</h3>
                    {result.developer && (
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{result.developer}</p>
                    )}
                    {result.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {result.genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-[10px] bg-slate-800 text-slate-300 border-0">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}