'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type SearchResult, DataSource } from '@/types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, X } from 'lucide-react';
import Image from 'next/image';

interface SearchBarProps {
  className?: string;
  onResultClick?: (result: SearchResult) => void;
}

export function SearchBar({ className, onResultClick }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      }
    } catch {
      // ignore search errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    if (onResultClick) {
      onResultClick(result);
    } else {
      if (result.dataSource === DataSource.igdb && result.igdbId) {
        router.push(`/game/igdb/${result.igdbId}`);
      } else if (result.dataSource === DataSource.rawg && result.rawgId) {
        router.push(`/game/rawg/${result.rawgId}`);
      }
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search games..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="pl-10 pr-10 border-slate-700 bg-slate-800/80 text-slate-100 placeholder:text-slate-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 animate-spin" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-purple-500/20 bg-slate-900 shadow-xl shadow-purple-500/5 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className="flex items-center gap-3 w-full px-3 py-2 hover:bg-slate-800 transition-colors text-left"
            >
              {/* Thumbnail */}
              <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded">
                {result.coverUrl ? (
                  <Image
                    src={result.coverUrl}
                    alt={result.title}
                    fill
                    className="object-cover"
                    sizes="36px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-800">
                    <span className="text-xs">🎮</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-100 truncate">{result.title}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {result.developer && <span>{result.developer}</span>}
                </div>
              </div>

              {/* Source badge */}
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${
                  result.dataSource === DataSource.igdb
                    ? 'border-purple-500/30 text-purple-400'
                    : 'border-blue-500/30 text-blue-400'
                }`}
              >
                {result.dataSource === DataSource.igdb ? 'IGDB' : 'RAWG'}
              </Badge>

              {result.rating !== undefined && result.rating > 0 && (
                <span className="text-xs text-yellow-400 shrink-0">⭐ {result.rating.toFixed(1)}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}