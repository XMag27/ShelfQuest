import { create } from 'zustand';
import { type Game, type Collection, PlayStatus, GamePlatform } from '@/types';
import * as firestore from '@/lib/firebase-firestore';

interface GameState {
  games: Game[];
  collections: Collection[];
  loading: boolean;
  error: string | null;
  filterStatus: PlayStatus | null;
  filterPlatform: GamePlatform | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  sortBy: 'dateAdded' | 'title' | 'rating' | 'hoursPlayed';
  sortOrder: 'asc' | 'desc';

  // Actions
  loadGames: (userId: string) => Promise<void>;
  addGame: (userId: string, game: Omit<Game, 'id'>) => Promise<string>;
  updateGame: (userId: string, gameId: string, data: Partial<Game>) => Promise<void>;
  deleteGame: (userId: string, gameId: string) => Promise<void>;
  setFilterStatus: (status: PlayStatus | null) => void;
  setFilterPlatform: (platform: GamePlatform | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setSortBy: (sort: 'dateAdded' | 'title' | 'rating' | 'hoursPlayed') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  loadCollections: (userId: string) => Promise<void>;
  addCollection: (userId: string, collection: Omit<Collection, 'id'>) => Promise<string>;
  updateCollection: (userId: string, collectionId: string, data: Partial<Collection>) => Promise<void>;
  deleteCollection: (userId: string, collectionId: string) => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  collections: [],
  loading: false,
  error: null,
  filterStatus: null,
  filterPlatform: null,
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'dateAdded',
  sortOrder: 'desc',

  loadGames: async (userId) => {
    set({ loading: true, error: null });
    try {
      const games = await firestore.getAllGames(userId);
      set({ games, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addGame: async (userId, game) => {
    const id = await firestore.addGame(userId, game);
    set((state) => ({ games: [{ ...game, id }, ...state.games] }));
    return id;
  },

  updateGame: async (userId, gameId, data) => {
    await firestore.updateGame(userId, gameId, data);
    set((state) => ({
      games: state.games.map((g) => (g.id === gameId ? { ...g, ...data } : g)),
    }));
  },

  deleteGame: async (userId, gameId) => {
    await firestore.deleteGame(userId, gameId);
    set((state) => ({ games: state.games.filter((g) => g.id !== gameId) }));
  },

  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPlatform: (platform) => set({ filterPlatform: platform }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSortOrder: (order) => set({ sortOrder: order }),

  loadCollections: async (userId) => {
    try {
      const collections = await firestore.getAllCollections(userId);
      set({ collections });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addCollection: async (userId, collection) => {
    const id = await firestore.addCollection(userId, collection);
    set((state) => ({ collections: [{ ...collection, id }, ...state.collections] }));
    return id;
  },

  updateCollection: async (userId, collectionId, data) => {
    await firestore.updateCollection(userId, collectionId, data);
    set((state) => ({
      collections: state.collections.map((c) => (c.id === collectionId ? { ...c, ...data } : c)),
    }));
  },

  deleteCollection: async (userId, collectionId) => {
    await firestore.deleteCollection(userId, collectionId);
    set((state) => ({ collections: state.collections.filter((c) => c.id !== collectionId) }));
  },
}));

// Selector for filtered/sorted games
export function useFilteredGames() {
  return useGameStore((state) => {
    let filtered = [...state.games];

    if (state.filterStatus) {
      filtered = filtered.filter((g) => g.playStatus === state.filterStatus);
    }
    if (state.filterPlatform) {
      filtered = filtered.filter((g) => g.platforms.includes(state.filterPlatform!));
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter((g) => g.title.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => {
      const order = state.sortOrder === 'asc' ? 1 : -1;
      switch (state.sortBy) {
        case 'title':
          return order * a.title.localeCompare(b.title);
        case 'rating':
          return order * (a.personalRating - b.personalRating);
        case 'hoursPlayed':
          return order * (a.hoursPlayed - b.hoursPlayed);
        case 'dateAdded':
        default:
          return order * (new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
      }
    });

    return filtered;
  });
}