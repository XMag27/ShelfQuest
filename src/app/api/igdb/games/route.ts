import { NextRequest, NextResponse } from 'next/server';
import { searchGames, getGameById } from '@/lib/igdb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, igdbId } = body;

    if (igdbId) {
      const game = await getGameById(igdbId);
      return NextResponse.json(game);
    }

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const results = await searchGames(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}