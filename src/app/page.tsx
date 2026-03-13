import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-5xl font-bold mb-4">Bingo Host</h1>
        <p className="text-xl text-text-secondary mb-12">
          Real-time bingo hosting for live venues
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/host/dashboard"
            className="px-8 py-4 bg-primary text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity"
          >
            Host a Game
          </Link>
          <Link
            href="/play"
            className="px-8 py-4 bg-surface border border-border rounded-2xl font-semibold hover:bg-elevated transition-colors"
          >
            Join a Game
          </Link>
        </div>
      </div>
    </div>
  );
}
