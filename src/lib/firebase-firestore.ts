import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { type Game, type Collection, type PlaySession, type UserProfile, PlayStatus, CompletionStatus, GamePlatform } from '@/types';

// --- Games CRUD ---

const GAMES_COLLECTION = 'games';
const COLLECTIONS_COLLECTION = 'collections';
const SESSIONS_COLLECTION = 'playSessions';
const PROFILES_COLLECTION = 'profiles';

export function gamesCollectionRef(userId: string) {
  return collection(db, 'users', userId, GAMES_COLLECTION);
}

export function gameDocRef(userId: string, gameId: string) {
  return doc(db, 'users', userId, GAMES_COLLECTION, gameId);
}

export async function addGame(userId: string, game: Omit<Game, 'id'>): Promise<string> {
  const docRef = await addDoc(gamesCollectionRef(userId), game);
  return docRef.id;
}

export async function getGame(userId: string, gameId: string): Promise<Game | null> {
  const docSnap = await getDoc(gameDocRef(userId, gameId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Game;
}

export async function updateGame(userId: string, gameId: string, data: Partial<Game>): Promise<void> {
  await updateDoc(gameDocRef(userId, gameId), data);
}

export async function deleteGame(userId: string, gameId: string): Promise<void> {
  await deleteDoc(gameDocRef(userId, gameId));
}

export async function getAllGames(userId: string): Promise<Game[]> {
  const q = query(gamesCollectionRef(userId), orderBy('dateAdded', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
}

export async function getGamesByStatus(userId: string, status: PlayStatus): Promise<Game[]> {
  const q = query(gamesCollectionRef(userId), where('playStatus', '==', status), orderBy('dateAdded', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
}

export async function getGamesByPlatform(userId: string, platform: GamePlatform): Promise<Game[]> {
  const q = query(gamesCollectionRef(userId), where('platforms', 'array-contains', platform), orderBy('dateAdded', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
}

export function subscribeToGames(userId: string, callback: (games: Game[]) => void): Unsubscribe {
  const q = query(gamesCollectionRef(userId), orderBy('dateAdded', 'desc'));
  return onSnapshot(q, (snap) => {
    const games = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Game));
    callback(games);
  });
}

// --- Collections CRUD ---

export function collectionsCollectionRef(userId: string) {
  return collection(db, 'users', userId, COLLECTIONS_COLLECTION);
}

export function collectionDocRef(userId: string, collectionId: string) {
  return doc(db, 'users', userId, COLLECTIONS_COLLECTION, collectionId);
}

export async function addCollection(userId: string, collection: Omit<Collection, 'id'>): Promise<string> {
  const docRef = await addDoc(collectionsCollectionRef(userId), collection);
  return docRef.id;
}

export async function getCollection(userId: string, collectionId: string): Promise<Collection | null> {
  const docSnap = await getDoc(collectionDocRef(userId, collectionId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Collection;
}

export async function getAllCollections(userId: string): Promise<Collection[]> {
  const q = query(collectionsCollectionRef(userId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Collection));
}

export async function updateCollection(userId: string, collectionId: string, data: Partial<Collection>): Promise<void> {
  await updateDoc(collectionDocRef(userId, collectionId), data);
}

export async function deleteCollection(userId: string, collectionId: string): Promise<void> {
  await deleteDoc(collectionDocRef(userId, collectionId));
}

export function subscribeToCollections(userId: string, callback: (collections: Collection[]) => void): Unsubscribe {
  const q = query(collectionsCollectionRef(userId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const collections = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Collection));
    callback(collections);
  });
}

// --- Play Sessions ---

export function sessionsCollectionRef(userId: string) {
  return collection(db, 'users', userId, SESSIONS_COLLECTION);
}

export async function addPlaySession(userId: string, session: Omit<PlaySession, 'id'>): Promise<string> {
  const docRef = await addDoc(sessionsCollectionRef(userId), session);
  return docRef.id;
}

export async function getPlaySessions(userId: string, gameId: string): Promise<PlaySession[]> {
  const q = query(sessionsCollectionRef(userId), where('gameId', '==', gameId), orderBy('startTime', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlaySession));
}

// --- User Profile ---

export function profileDocRef(userId: string) {
  return doc(db, 'users', userId, PROFILES_COLLECTION, 'profile');
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(profileDocRef(userId));
  if (!docSnap.exists()) return null;
  return docSnap.data() as UserProfile;
}

export async function setUserProfile(userId: string, profile: UserProfile): Promise<void> {
  await setDoc(profileDocRef(userId), profile, { merge: true });
}

// --- Stats helpers ---

export async function getGameStats(userId: string) {
  const games = await getAllGames(userId);
  const totalGames = games.length;
  const byStatus: Record<string, number> = {};
  const byPlatform: Record<string, number> = {};
  let totalHours = 0;
  let totalRating = 0;
  let ratedGames = 0;

  for (const game of games) {
    byStatus[game.playStatus] = (byStatus[game.playStatus] || 0) + 1;
    for (const p of game.platforms) {
      byPlatform[p] = (byPlatform[p] || 0) + 1;
    }
    totalHours += game.hoursPlayed;
    if (game.personalRating > 0) {
      totalRating += game.personalRating;
      ratedGames++;
    }
  }

  return {
    totalGames,
    byStatus,
    byPlatform,
    totalHours,
    averageRating: ratedGames > 0 ? totalRating / ratedGames : 0,
  };
}