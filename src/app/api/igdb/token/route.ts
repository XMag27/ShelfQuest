import { NextResponse } from 'next/server';
import { getAccessTokenForClient } from '@/lib/igdb';

export async function GET() {
  try {
    const { accessToken, expiresIn } = await getAccessTokenForClient();
    return NextResponse.json({ accessToken, expiresIn });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}