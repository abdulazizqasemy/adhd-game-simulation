import React, { createContext, useContext, useState, useCallback } from 'react';

export interface GameStats {
  gemsCollected: number;
  tasksCompleted: number;
  totalScore: number;
  currentLevel: number;
  achievements: string[];
}

export interface TaskResult {
  taskId: string;
  taskName: string;
  score: number;
  gemsEarned: number;
  accuracy?: number;
  reactionTime?: number;
  completedAt: string;
}

interface GameContextType {
  stats: GameStats;
  taskHistory: TaskResult[];
  currentTask: string | null;
  addGems: (amount: number) => void;
  completeTask: (result: TaskResult) => void;
  setCurrentTask: (taskId: string | null) => void;
  resetGame: () => void;
  unlockAchievement: (achievementId: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialStats: GameStats = {
  gemsCollected: 0,
  tasksCompleted: 0,
  totalScore: 0,
  currentLevel: 1,
  achievements: [],
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<GameStats>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('adhd-game-stats');
    return saved ? JSON.parse(saved) : initialStats;
  });

  const [taskHistory, setTaskHistory] = useState<TaskResult[]>(() => {
    const saved = localStorage.getItem('adhd-game-history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTask, setCurrentTask] = useState<string | null>(null);

  // Save stats to localStorage whenever they change
  const updateStats = useCallback((newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem('adhd-game-stats', JSON.stringify(newStats));
  }, []);

  const addGems = useCallback((amount: number) => {
    setStats(prev => {
      const updated = {
        ...prev,
        gemsCollected: prev.gemsCollected + amount,
      };
      updateStats(updated);
      return updated;
    });
  }, [updateStats]);

  const completeTask = useCallback((result: TaskResult) => {
    setTaskHistory(prev => {
      const updated = [...prev, result];
      localStorage.setItem('adhd-game-history', JSON.stringify(updated));
      return updated;
    });

    setStats(prev => {
      const updated = {
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
        totalScore: prev.totalScore + result.score,
        gemsCollected: prev.gemsCollected + result.gemsEarned,
        currentLevel: Math.floor(prev.tasksCompleted / 5) + 1,
      };
      updateStats(updated);
      return updated;
    });
  }, [updateStats]);

  const unlockAchievement = useCallback((achievementId: string) => {
    setStats(prev => {
      if (prev.achievements.includes(achievementId)) return prev;
      const updated = {
        ...prev,
        achievements: [...prev.achievements, achievementId],
      };
      updateStats(updated);
      return updated;
    });
  }, [updateStats]);

  const resetGame = useCallback(() => {
    setStats(initialStats);
    setTaskHistory([]);
    localStorage.removeItem('adhd-game-stats');
    localStorage.removeItem('adhd-game-history');
  }, []);

  return (
    <GameContext.Provider
      value={{
        stats,
        taskHistory,
        currentTask,
        addGems,
        completeTask,
        setCurrentTask,
        resetGame,
        unlockAchievement,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
