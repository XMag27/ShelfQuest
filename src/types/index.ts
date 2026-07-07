// ShelfQuest TypeScript Types

export enum PlayStatus {
  backlog = 'backlog',
  playing = 'playing',
  completed = 'completed',
  onHold = 'on_hold',
  dropped = 'dropped',
  wishlist = 'wishlist',
}

export enum CompletionStatus {
  mainStory = 'main_story',
  completionist = 'completionist',
  hundredPercent = 'hundred_percent',
}

export enum GamePlatform {
  nintendoSwitch = 'nintendo_switch',
  xbox = 'xbox',
  steam = 'steam',
  playstation = 'playstation',
}

export enum DataSource {
  igdb = 'igdb',
  rawg = 'rawg',
}

export interface Game {
  id: string;
  igdbId?: string;
  rawgId?: string;
  title: string;
  coverUrl?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string; // ISO string for Firestore compatibility
  genres: string[];
  platforms: GamePlatform[];
  playStatus: PlayStatus;
  completionStatus: CompletionStatus;
  personalRating: number; // 0-10
  hoursPlayed: number;
  notes?: string;
  dateAdded: string; // ISO string
  dataSource?: DataSource;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  gameIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlaySession {
  id: string;
  userId: string;
  gameId: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

export interface UserProfile {
  userId: string;
  displayName?: string;
  photoUrl?: string;
  preferredPlatforms: GamePlatform[];
  notifications: {
    releaseReminders: boolean;
    dealAlerts: boolean;
  };
}

export interface SearchResult {
  id: string;
  title: string;
  coverUrl?: string;
  description?: string;
  developer?: string;
  publisher?: string;
  releaseDate?: string;
  genres: string[];
  platforms: string[];
  dataSource: DataSource;
  igdbId?: string;
  rawgId?: string;
  rating?: number;
}

// Firestore converter helpers
export const playStatusLabelMap: Record<PlayStatus, string> = {
  [PlayStatus.backlog]: 'Backlog',
  [PlayStatus.playing]: 'Playing',
  [PlayStatus.completed]: 'Completed',
  [PlayStatus.onHold]: 'On Hold',
  [PlayStatus.dropped]: 'Dropped',
  [PlayStatus.wishlist]: 'Wishlist',
};

export const completionStatusLabelMap: Record<CompletionStatus, string> = {
  [CompletionStatus.mainStory]: 'Main Story',
  [CompletionStatus.completionist]: 'Completionist',
  [CompletionStatus.hundredPercent]: '100%',
};

export const platformLabelMap: Record<GamePlatform, string> = {
  [GamePlatform.nintendoSwitch]: 'Nintendo Switch',
  [GamePlatform.xbox]: 'Xbox',
  [GamePlatform.steam]: 'Steam',
  [GamePlatform.playstation]: 'PlayStation',
};

export const platformIconMap: Record<GamePlatform, string> = {
  [GamePlatform.nintendoSwitch]: '🟢',
  [GamePlatform.xbox]: '🟩',
  [GamePlatform.steam]: '🔵',
  [GamePlatform.playstation]: '🟣',
};

export const playStatusColorMap: Record<PlayStatus, string> = {
  [PlayStatus.backlog]: 'bg-gray-500',
  [PlayStatus.playing]: 'bg-green-500',
  [PlayStatus.completed]: 'bg-blue-500',
  [PlayStatus.onHold]: 'bg-yellow-500',
  [PlayStatus.dropped]: 'bg-red-500',
  [PlayStatus.wishlist]: 'bg-purple-500',
};