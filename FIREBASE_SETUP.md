# Firebase Setup Guide for Bingo Host App

This guide walks you through setting up Firebase for your Next.js Bingo Host application.

## Prerequisites

- A Google account
- Node.js installed (for Firebase CLI)
- npm or yarn installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "Bingo Host App")
4. Click **Continue**
5. **Optional**: Enable Google Analytics (recommended for production)
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Register a Web App

1. In your Firebase project dashboard, click the **Web icon** (`</>`) or **"Add app"** → **Web**
2. Register your app:
   - **App nickname**: "Bingo Host Web" (or any name)
   - **Firebase Hosting**: Check this box if you plan to deploy to Firebase Hosting
3. Click **Register app**
4. **Copy the Firebase configuration object** - you'll need these values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

## Step 3: Set Up Environment Variables

1. In your project root, copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase config values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza... (from firebaseConfig.apiKey)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

   **Important**: All values must start with `NEXT_PUBLIC_` to be accessible in the browser.

## Step 4: Enable Firebase Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **Get started**
3. Enable **Email/Password** authentication:
   - Click on **Email/Password**
   - Toggle **Enable** to ON
   - Click **Save**
4. Enable **Anonymous** authentication (for players):
   - Click on **Anonymous**
   - Toggle **Enable** to ON
   - Click **Save**

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll deploy security rules next)
4. Select a **location** for your database (choose closest to your users)
5. Click **Enable**

## Step 6: Deploy Firestore Security Rules

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```
   - Select **Firestore** and **Hosting** (if deploying to Firebase)
   - Use existing `firestore.rules` file when prompted
   - Use existing `firestore.indexes.json` when prompted

4. Deploy Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

   This deploys the security rules from `firestore.rules` that:
   - Allow hosts to create/manage their own games
   - Allow authenticated users to read games
   - Allow players to join games (create player documents)
   - Restrict called numbers to be written only by game hosts

## Step 7: Set Up Firestore Indexes (Optional)

If you plan to query games by `gameCode`, you may need an index. The app currently queries by `gameCode` which requires an index.

1. Check `firestore.indexes.json` for required indexes
2. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

   Or create indexes manually in Firebase Console:
   - Go to **Firestore Database** → **Indexes** tab
   - Click **Create Index**
   - Collection: `games`
   - Fields: `gameCode` (Ascending)
   - Click **Create**

## Step 8: Verify Setup

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test authentication:
   - Go to `http://localhost:3000/register`
   - Create a test account
   - Check Firebase Console → Authentication to see the user

4. Test Firestore:
   - After creating a game, check Firebase Console → Firestore Database
   - You should see a `games` collection with your game document

## Step 9: Configure Authorized Domains (For Production)

When deploying to production, add your domain to authorized domains:

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `your-app.vercel.app` or custom domain)

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure `.env.local` exists and has all required variables
- Restart your Next.js dev server after adding environment variables
- Verify all variables start with `NEXT_PUBLIC_`

### "Permission denied" errors in Firestore
- Make sure you've deployed Firestore security rules
- Check that users are authenticated before accessing Firestore
- Verify the rules in `firestore.rules` match your use case

### Firebase not initializing
- Check browser console for errors
- Verify environment variables are loaded (they should be available in browser)
- Make sure you're using the web app config, not iOS/Android config

## Next Steps

- **Deploy to Vercel**: Set the same environment variables in Vercel dashboard
- **Set up Firebase Hosting** (optional): Use `firebase deploy --only hosting` after building
- **Monitor usage**: Check Firebase Console for usage and quotas
- **Set up billing alerts**: Configure budget alerts in Firebase Console

## Firebase Project Structure

Your Firestore database will have this structure:

```
/games/{gameId}
  - hostId: string
  - gameCode: string
  - status: "setup" | "active" | "paused" | "ended"
  - createdAt: timestamp
  - currentRound: number
  - totalRounds: number
  - rounds: array

/games/{gameId}/calledNumbers/{docId}
  - number: string (e.g., "B7", "I23")
  - calledAt: timestamp
  - sequence: number

/games/{gameId}/players/{playerId}
  - displayName: string | null
  - joinedAt: timestamp
  - isActive: boolean

/users/{userId}
  - email: string
  - displayName: string
  - createdAt: timestamp
  - gamesHosted: number
```

## Security Rules Summary

- **Games**: Hosts can create/update/delete their own games
- **Called Numbers**: Only game hosts can write; all authenticated users can read
- **Players**: Users can create/update their own player documents
- **Users**: Users can manage their own user documents

For detailed rules, see `firestore.rules`.
