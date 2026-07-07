// RAWG API client - SERVER-SIDE ONLY
// Routed through Next.js API routes for consistency

const RAWG_BASE_URL = 'https://api.rawg.io/api';

function getApiKey(): string {
  return process.env.RAWG_API_KEY!;
}

export async function rawgSearch(query: string, page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    key: getApiKey(),
    search: query,
    page: page.toString(),
    page_size: pageSize.toString(),
  });

  const response = await fetch(`${RAWG_BASE_URL}/games?${params}`);
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }
  return response.json();
}

export async function rawgGetGame(rawgId: number) {
  const params = new URLSearchParams({ key: getApiKey() });
  const response = await fetch(`${RAWG_BASE_URL}/games/${rawgId}?${params}`);
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }
  return response.json();
}

export async function rawgGetPopular(page = 1, pageSize = 20) {
  const params = new URLSearchParams({
    key: getApiKey(),
    ordering: '-rating',
    page: page.toString(),
    page_size: pageSize.toString(),
    platforms: '7,3,4', // Switch, iOS, Xbox
  });

  const response = await fetch(`${RAWG_BASE_URL}/games?${params}`);
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }
  return response.json();
}

export async function rawgGetGameScreenshots(rawgId: number) {
  const params = new URLSearchParams({ key: getApiKey() });
  const response = await fetch(`${RAWG_BASE_URL}/games/${rawgId}/screenshots?${params}`);
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status}`);
  }
  return response.json();
}