// Environment variable validation for server-side use

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get firebaseApiKey() { return process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ''; },
  get igdbClientId() { return requireEnv('IGDB_CLIENT_ID'); },
  get igdbClientSecret() { return requireEnv('IGDB_CLIENT_SECRET'); },
  get rawgApiKey() { return requireEnv('RAWG_API_KEY'); },
};