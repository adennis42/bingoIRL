/**
 * Firebase mocks for testing
 * 
 * This file is not a test file - it's a mock module.
 * Jest will try to run it as a test, so we need to exclude it.
 */

export const mockFirestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
  Timestamp: {
    fromDate: jest.fn((date: Date) => ({
      toDate: () => date,
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
    })),
    now: jest.fn(() => ({
      toDate: () => new Date(),
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: 0,
    })),
  },
};

export const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn(); // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  signInAnonymously: jest.fn(),
};

export const mockFirebaseApp = {
  name: "[DEFAULT]",
  options: {},
};

// Mock Firebase modules
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => mockFirestore),
  collection: jest.fn((db, ...pathSegments) => ({
    _path: pathSegments,
    withConverter: jest.fn((converter) => ({
      _converter: converter,
      _path: pathSegments,
    })),
  })),
  doc: jest.fn((db, ...pathSegments) => ({
    id: pathSegments[pathSegments.length - 1],
    path: pathSegments.join("/"),
    withConverter: jest.fn((converter) => ({
      _converter: converter,
      id: pathSegments[pathSegments.length - 1],
      path: pathSegments.join("/"),
    })),
  })),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn((ref, ...constraints) => ({
    _ref: ref,
    _constraints: constraints,
  })),
  where: jest.fn((field, op, value) => ({ field, op, value })),
  orderBy: jest.fn((field, direction) => ({ field, direction })),
  onSnapshot: jest.fn(),
  Timestamp: {
    fromDate: mockFirestore.Timestamp.fromDate,
    now: mockFirestore.Timestamp.now,
  },
  QueryDocumentSnapshot: class MockQueryDocumentSnapshot {
    id: string;
    data: any;
    exists: boolean;
    constructor(id: string, data: any) {
      this.id = id;
      this.data = data;
      this.exists = !!data;
    }
  },
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => mockAuth),
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  signInAnonymously: jest.fn(),
}));

jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => mockFirebaseApp),
  getApps: jest.fn(() => []),
}));
