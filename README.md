# Bingo Host App - Next.js

A real-time bingo hosting web application built with Next.js 14, TypeScript, Firebase, and Tailwind CSS.

## Features

- **Host Management**: Create and manage live bingo games
- **Real-time Updates**: Players see called numbers instantly via Firebase
- **Game Codes**: 6-digit alphanumeric codes for easy joining
- **Multiple Rounds**: Configure up to 10 rounds per game with different patterns
- **Winning Patterns**: Traditional line, four corners, and blackout

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.local.example` to `.env.local` and fill in your Firebase configuration:
   ```bash
   cp .env.local.example .env.local
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # React components
├── lib/              # Utilities, hooks, stores
├── types/            # TypeScript type definitions
└── middleware.ts     # Route protection
```

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Anonymous)
3. Create a Firestore database
4. Deploy Firestore security rules from `firestore.rules`
5. Copy your Firebase config to `.env.local`

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

This app is configured for Vercel deployment. Simply connect your GitHub repository to Vercel and deploy.

Make sure to set your environment variables in Vercel's dashboard.

## License

Private project
