import { NextRequest, NextResponse } from 'next/server';
import { searchGames, getGameById, getPopularGames, getCoverUrl } from '@/lib/igdb';
import { rawgSearch, rawgGetGame, rawgGetPopular } from '@/lib/rawg';
import { type SearchResult, DataSource } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const igdbId = searchParams.get('igdbId');
  const rawgId = searchParams.get('rawgId');
  const popular = searchParams.get('popular');

  try {
    if (igdbId) {
      const game = await getGameById(parseInt(igdbId));
      return NextResponse.json(game);
    }

    if (rawgId) {
      const game = await rawgGetGame(parseInt(rawgId));
      return NextResponse.json(game);
    }

    if (!query && !popular) {
      return NextResponse.json({ error: 'Query parameter "q" or "popular" is required' }, { status: 400 });
    }

    const results: SearchResult[] = [];

    if (popular) {
      const [igdbResults, rawgResults] = await Promise.allSettled([
        getPopularGames(10),
        rawgGetPopular(1, 10),
      ]);

      if (igdbResults.status === 'fulfilled') {
        for (const game of igdbResults.value) {
          results.push({
            id: `igdb-${game.id}`,
            title: game.name,
            coverUrl: getCoverUrl(game.cover?.image_id || null) ?? undefined,
            description: game.summary,
            developer: game.involved_companies?.find((c: { developer: boolean }) => c.developer)?.company?.name,
            genres: game.genres?.map((g: { name: string }) => g.name) || [],
            platforms: game.platforms?.map((p: { name: string }) => p.name) || [],
            dataSource: DataSource.igdb,
            igdbId: String(game.id),
            rating: game.rating ? game.rating / 10 : undefined,
          });
        }
      }

      if (rawgResults.status === 'fulfilled') {
        for (const game of rawgResults.value.results || []) {
          results.push({
            id: `rawg-${game.id}`,
            title: game.name,
            coverUrl: game.background_image ?? undefined,
            description: game.description_raw,
            developer: game.developers?.[0]?.name,
            genres: game.genres?.map((g: { name: string }) => g.name) || [],
            platforms: game.platforms?.map((p: { platform: { name: string } }) => p.platform.name) || [],
            dataSource: DataSource.rawg,
            rawgId: String(game.id),
            rating: game.rating,
          });
        }
      }

      return NextResponse.json(results);
    }

    // Search both APIs in parallel
    const [igdbResults, rawgResults] = await Promise.allSettled([
      searchGames(query!),
      rawgSearch(query!),
    ]);

    if (igdbResults.status === 'fulfilled') {
      for (const game of igdbResults.value) {
        results.push({
          id: `igdb-${game.id}`,
          title: game.name,
          coverUrl: getCoverUrl(game.cover?.image_id || null) ?? undefined,
          description: game.summary,
          developer: game.involved_companies?.find((c: { developer: boolean }) => c.developer)?.company?.name,
          releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000).toISOString() : undefined,
          genres: game.genres?.map((g: { name: string }) => g.name) || [],
          platforms: game.platforms?.map((p: { name: string }) => p.name) || [],
          dataSource: DataSource.igdb,
          igdbId: String(game.id),
          rating: game.rating ? game.rating / 10 : undefined,
        });
      }
    }

    if (rawgResults.status === 'fulfilled') {
      for (const game of rawgResults.value.results || []) {
        results.push({
          id: `rawg-${game.id}`,
          title: game.name,
          coverUrl: game.background_image ?? undefined,
          description: game.description_raw,
          developer: game.developers?.[0]?.name,
          releaseDate: game.released || undefined,
          genres: game.genres?.map((g: { name: string }) => g.name) || [],
          platforms: game.platforms?.map((p: { platform: { name: string } }) => p.platform.name) || [],
          dataSource: DataSource.rawg,
          rawgId: String(game.id),
          rating: game.rating,
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}