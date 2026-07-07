// IGDB API client - SERVER-SIDE ONLY
// Must be called from Next.js API routes to avoid CORS and protect secrets

const IGDB_BASE_URL = 'https://api.igdb.com/v4';

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires_at > Date.now()) {
    return cachedToken.access_token;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.IGDB_CLIENT_ID!,
      client_secret: process.env.IGDB_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get IGDB access token: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000, // refresh 1 min early
  };

  return cachedToken.access_token;
}

async function igdbRequest(endpoint: string, body: string) {
  const token = await getAccessToken();
  const response = await fetch(`${IGDB_BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID!,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/plain',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`IGDB API error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

export async function searchGames(query: string, limit = 20) {
  const fields = 'id,name,cover.image_id,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.publisher,involved_companies.developer';
  const body = `search "${query}"; fields ${fields}; limit ${limit};`;
  return igdbRequest('games', body);
}

export async function getGameById(igdbId: number) {
  const fields = 'id,name,cover.image_id,summary,genres.name,platforms.name,first_release_date,involved_companies.company.name,involved_companies.publisher,involved_companies.developer,rating,rating_count,storyline';
  const body = `fields ${fields}; where id = ${igdbId};`;
  const results = await igdbRequest('games', body);
  return results[0] || null;
}

export async function getPopularGames(limit = 20) {
  const fields = 'id,name,cover.image_id,summary,genres.name,platforms.name,first_release_date,rating';
  const body = `fields ${fields}; where rating > 80 & platforms = (6,167,169); sort rating desc; limit ${limit};`;
  return igdbRequest('games', body);
}

export function getCoverUrl(imageId: string | null, size: 'cover_small' | 'cover_big' | '720p' | '1080p' = 'cover_big') {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/${size}/${imageId}.jpg`;
}

export async function getAccessTokenForClient(): Promise<{ accessToken: string; expiresIn: number }> {
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.IGDB_CLIENT_ID!,
      client_secret: process.env.IGDB_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get IGDB access token');
  }

  const data = await response.json();
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}