import { useGame } from '@/contexts/GameContext';
import { Gem, Zap } from 'lucide-react';

export function GameHeader() {
  const { stats } = useGame();

  return (
    <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
      <div className="container py-4 px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <div className="flex-1">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              Save the Muse Home
            </h1>
            <p className="text-sm opacity-90 mt-1">Cognitive Training Adventure</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {/* Gems Counter */}
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Gem className="w-5 h-5" fill="currentColor" />
              <div>
                <p className="text-xs opacity-75">Gems</p>
                <p className="text-xl font-bold">{stats.gemsCollected}</p>
              </div>
            </div>

            {/* Level & Score */}
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Zap className="w-5 h-5" fill="currentColor" />
              <div>
                <p className="text-xs opacity-75">Level {stats.currentLevel}</p>
                <p className="text-xl font-bold">{stats.totalScore}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(((stats.tasksCompleted % 5) / 5) * 100, 100)}%`,
            }}
          />
        </div>
        <p className="text-xs opacity-75 mt-1">
          {stats.tasksCompleted % 5}/5 tasks to next level
        </p>
      </div>
    </header>
  );
}
