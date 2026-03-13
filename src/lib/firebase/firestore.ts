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
  onSnapshot,
  Timestamp,
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
} from "./converters";
import type { Game, CalledNumber, Player, CustomPattern } from "@/types";

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
