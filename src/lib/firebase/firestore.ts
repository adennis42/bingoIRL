import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  Timestamp,
  increment,
  QueryConstraint,
  FirestoreError,
} from "firebase/firestore";
import { db, auth } from "./config";
import { getFirebaseErrorMessage, FirebaseError, PermissionError, logError } from "@/lib/utils/errorHandler";
import {
  gameConverter,
  calledNumberConverter,
  playerConverter,
  customPatternConverter,
  leaderboardEntryConverter,
  seasonConverter,
  seasonalEntryConverter,
} from "./converters";
import type { Game, CalledNumber, Player, CustomPattern, LeaderboardEntry, Season, SeasonalEntry } from "@/types";

// Games
export async function getGame(gameId: string): Promise<Game | null> {
  const gameDoc = await getDoc(
    doc(db, "games", gameId).withConverter(gameConverter)
  );
  return gameDoc.exists() ? gameDoc.data() : null;
}

export async function getGameByCode(gameCode: string): Promise<Game | null> {
  const q = query(
    collection(db, "games").withConverter(gameConverter),
    where("gameCode", "==", gameCode.toUpperCase())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

export async function createGame(game: Omit<Game, "id">): Promise<string> {
  const gamesRef = collection(db, "games").withConverter(gameConverter);
  const docRef = await addDoc(gamesRef, game as Game);
  return docRef.id;
}

export async function updateGame(
  gameId: string,
  updates: Partial<Game>
): Promise<void> {
  try {
    // Ensure user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new PermissionError("You must be authenticated to update a game");
    }
    
    const gameRef = doc(db, "games", gameId);
    
    // Convert updates to Firestore format
    const firestoreUpdates: any = {};
    
    if (updates.status !== undefined) {
      firestoreUpdates.status = updates.status;
    }
    
    if (updates.currentRound !== undefined) {
      firestoreUpdates.currentRound = updates.currentRound;
    }
    
    if (updates.rounds !== undefined) {
      firestoreUpdates.rounds = updates.rounds.map((round) => ({
        roundNumber: round.roundNumber,
        pattern: round.pattern,
        prize: round.prize || null,
        winnerId: round.winnerId || null,
        winnerName: round.winnerName || null,
        completedAt: round.completedAt
          ? Timestamp.fromDate(round.completedAt)
          : null,
      }));
    }
    
    await updateDoc(gameRef, firestoreUpdates);
  } catch (error) {
    logError(error, { operation: "updateGame", gameId, updates });
    
    if (error instanceof PermissionError) {
      throw error;
    }
    
    if (error instanceof FirestoreError) {
      if (error.code === "permission-denied") {
        throw new PermissionError(getFirebaseErrorMessage(error));
      }
      throw new FirebaseError(error.code, error.message, error);
    }
    
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export function subscribeToGame(
  gameId: string,
  callback: (game: Game | null) => void
): () => void {
  return onSnapshot(
    doc(db, "games", gameId).withConverter(gameConverter),
    (snapshot) => {
      callback(snapshot.exists() ? snapshot.data() : null);
    }
  );
}

// Called Numbers
export async function addCalledNumber(
  gameId: string,
  calledNumber: Omit<CalledNumber, "id">
): Promise<string> {
  const numbersRef = collection(
    db,
    "games",
    gameId,
    "calledNumbers"
  ).withConverter(calledNumberConverter);
  const docRef = await addDoc(numbersRef, calledNumber as CalledNumber);
  return docRef.id;
}

export async function removeCalledNumber(gameId: string, numberId: string): Promise<void> {
  const ref = doc(db, "games", gameId, "calledNumbers", numberId);
  await deleteDoc(ref);
}

export async function clearCalledNumbers(gameId: string): Promise<void> {
  const numbersRef = collection(db, "games", gameId, "calledNumbers");
  const snapshot = await getDocs(numbersRef);
  if (snapshot.empty) return;
  // Batch deletes in chunks of 500 (Firestore limit)
  const BATCH_SIZE = 500;
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export function subscribeToCalledNumbers(
  gameId: string,
  callback: (numbers: CalledNumber[]) => void
): () => void {
  const numbersRef = collection(
    db,
    "games",
    gameId,
    "calledNumbers"
  ).withConverter(calledNumberConverter);
  const q = query(numbersRef, orderBy("sequence", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}

// Players
export async function addPlayer(
  gameId: string,
  player: Omit<Player, "id">,
  playerId: string
): Promise<string> {
  try {
    if (!playerId) {
      throw new Error("Player ID (user UID) is required");
    }

    const playerRef = doc(
      db,
      "games",
      gameId,
      "players",
      playerId
    ).withConverter(playerConverter);
    
    await setDoc(playerRef, {
      ...player,
      id: playerId,
    } as Player);
    
    return playerId;
  } catch (error) {
    logError(error, { operation: "addPlayer", gameId, playerId });
    
    if (error instanceof FirestoreError) {
      if (error.code === "permission-denied") {
        throw new PermissionError("You don't have permission to join this game.");
      }
      throw new FirebaseError(error.code, error.message, error);
    }
    
    throw new Error(getFirebaseErrorMessage(error));
  }
}

export function subscribeToPlayers(
  gameId: string,
  callback: (players: Player[]) => void
): () => void {
  const playersRef = collection(
    db,
    "games",
    gameId,
    "players"
  ).withConverter(playerConverter);
  const q = query(playersRef, where("isActive", "==", true));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}

// Custom Patterns
export async function createCustomPattern(
  userId: string,
  pattern: Omit<CustomPattern, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<string> {
  const patternsRef = collection(
    db,
    "users",
    userId,
    "customPatterns"
  ).withConverter(customPatternConverter);
  const now = new Date();
  const patternData: CustomPattern = {
    ...pattern,
    id: "", // Will be set by Firestore
    userId,
    createdAt: now,
    updatedAt: now,
  };
  const docRef = await addDoc(patternsRef, patternData);
  return docRef.id;
}

export async function getCustomPatterns(userId: string): Promise<CustomPattern[]> {
  const patternsRef = collection(
    db,
    "users",
    userId,
    "customPatterns"
  ).withConverter(customPatternConverter);
  const q = query(patternsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
}

export async function getCustomPattern(
  userId: string,
  patternId: string
): Promise<CustomPattern | null> {
  const patternDoc = await getDoc(
    doc(db, "users", userId, "customPatterns", patternId).withConverter(
      customPatternConverter
    )
  );
  return patternDoc.exists() ? patternDoc.data() : null;
}

export async function updateCustomPattern(
  userId: string,
  patternId: string,
  updates: Partial<Omit<CustomPattern, "id" | "userId" | "createdAt">>
): Promise<void> {
  const patternRef = doc(
    db,
    "users",
    userId,
    "customPatterns",
    patternId
  ).withConverter(customPatternConverter);
  await updateDoc(patternRef, {
    ...updates,
    updatedAt: new Date(),
  } as any);
}

export async function deleteCustomPattern(
  userId: string,
  patternId: string
): Promise<void> {
  const patternRef = doc(
    db,
    "users",
    userId,
    "customPatterns",
    patternId
  );
  await deleteDoc(patternRef);
}

export function subscribeToHostGames(
  hostId: string,
  callback: (games: Game[]) => void
): () => void {
  const gamesRef = collection(db, "games").withConverter(gameConverter);
  const q = query(gamesRef, where("hostId", "==", hostId), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}

export function subscribeToCustomPatterns(
  userId: string,
  callback: (patterns: CustomPattern[]) => void
): () => void {
  const patternsRef = collection(
    db,
    "users",
    userId,
    "customPatterns"
  ).withConverter(customPatternConverter);
  const q = query(patternsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((doc) => doc.data()));
  });
}

// ─── Leaderboard ───────────────────────────────────────────────────────────

/**
 * Slugify a player name for use as a Firestore doc ID.
 * e.g. "John Doe" -> "john-doe"
 */
function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Record a win to the overall leaderboard (upsert by slugified player name).
 * If the player already exists, increments totalWins and updates lastWin/location.
 */
export async function recordOverallWin({
  playerName,
  location,
  gameId,
}: {
  playerName: string;
  location: string;
  gameId: string;
}): Promise<void> {
  const entryId = slugifyName(playerName);
  const ref = doc(db, "leaderboard_overall", entryId).withConverter(leaderboardEntryConverter);
  const snapshot = await getDoc(ref);
  const now = new Date();
  if (snapshot.exists()) {
    await updateDoc(ref, {
      totalWins: increment(1),
      lastWin: Timestamp.fromDate(now),
      lastGameId: gameId,
      location, // update to latest location
    });
  } else {
    await setDoc(ref, {
      id: entryId,
      playerName,
      location,
      totalWins: 1,
      lastWin: now,
      lastGameId: gameId,
    });
  }
}

/**
 * Record a win to a seasonal leaderboard entry.
 * Seasonal entries are stored at /seasons/{seasonId}/entries/{slugifiedName}.
 */
export async function recordSeasonalWin({
  seasonId,
  playerName,
  location,
  gameId,
}: {
  seasonId: string;
  playerName: string;
  location: string;
  gameId: string;
}): Promise<void> {
  const entryId = slugifyName(playerName);
  const ref = doc(db, "seasons", seasonId, "entries", entryId).withConverter(seasonalEntryConverter);
  const snapshot = await getDoc(ref);
  const now = new Date();
  if (snapshot.exists()) {
    await updateDoc(ref, {
      wins: increment(1),
      lastWin: Timestamp.fromDate(now),
      lastGameId: gameId,
      location,
    });
  } else {
    await setDoc(ref, {
      id: entryId,
      playerName,
      location,
      wins: 1,
      lastWin: now,
      lastGameId: gameId,
    });
  }
}

/** Fetch overall leaderboard, sorted by totalWins desc. */
export async function getOverallLeaderboard(): Promise<LeaderboardEntry[]> {
  const ref = collection(db, "leaderboard_overall").withConverter(leaderboardEntryConverter);
  const q = query(ref, orderBy("totalWins", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

/** Subscribe to overall leaderboard (live updates). */
export function subscribeToOverallLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void
): () => void {
  const ref = collection(db, "leaderboard_overall").withConverter(leaderboardEntryConverter);
  const q = query(ref, orderBy("totalWins", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => d.data()));
  });
}

/** Subscribe to seasonal leaderboard entries for a given season. */
export function subscribeToSeasonalLeaderboard(
  seasonId: string,
  callback: (entries: SeasonalEntry[]) => void
): () => void {
  const ref = collection(db, "seasons", seasonId, "entries").withConverter(seasonalEntryConverter);
  const q = query(ref, orderBy("wins", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => d.data()));
  });
}

// ─── Seasons ────────────────────────────────────────────────────────────

/** Create a new season. Only one active season should exist per host at a time. */
export async function createSeason(
  season: Omit<Season, "id">
): Promise<string> {
  const ref = collection(db, "seasons").withConverter(seasonConverter);
  const docRef = await addDoc(ref, season as Season);
  return docRef.id;
}

/** Get all seasons for a host, newest first. */
export async function getSeasonsByHost(hostId: string): Promise<Season[]> {
  const ref = collection(db, "seasons").withConverter(seasonConverter);
  const q = query(ref, where("hostId", "==", hostId), orderBy("startDate", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data());
}

/** Subscribe to seasons for a host (live). */
export function subscribeToSeasons(
  hostId: string,
  callback: (seasons: Season[]) => void
): () => void {
  const ref = collection(db, "seasons").withConverter(seasonConverter);
  const q = query(ref, where("hostId", "==", hostId), orderBy("startDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => d.data()));
  });
}

/** Get the currently active season for a host (null if none). */
export async function getActiveSeason(hostId: string): Promise<Season | null> {
  const ref = collection(db, "seasons").withConverter(seasonConverter);
  const q = query(ref, where("hostId", "==", hostId), where("active", "==", true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
}

/** Close a season (mark inactive + set endDate). */
export async function closeSeason(seasonId: string): Promise<void> {
  const ref = doc(db, "seasons", seasonId);
  await updateDoc(ref, {
    active: false,
    endDate: Timestamp.fromDate(new Date()),
  });
}
