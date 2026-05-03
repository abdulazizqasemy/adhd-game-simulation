import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Gem, RotateCcw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface Chest {
  id: number;
  hasGem: boolean;
  revealed: boolean;
  clicked: boolean;
}

const DIFFICULTIES = {
  easy: { chests: 4, duration: 30, gemsPerCorrect: 10 },
  medium: { chests: 6, duration: 45, gemsPerCorrect: 15 },
  hard: { chests: 8, duration: 60, gemsPerCorrect: 20 },
};

export default function TreasureGame() {
  const [, navigate] = useLocation();
  const { completeTask, addGems } = useGame();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState(false);
  const [chests, setChests] = useState<Chest[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const config = DIFFICULTIES[difficulty];

  // Initialize game
  const initializeGame = useCallback(() => {
    const numGems = Math.ceil(config.chests / 2);
    const gemPositions = new Set<number>();
    while (gemPositions.size < numGems) {
      gemPositions.add(Math.floor(Math.random() * config.chests));
    }

    const newChests: Chest[] = Array.from({ length: config.chests }, (_, i) => ({
      id: i,
      hasGem: gemPositions.has(i),
      revealed: false,
      clicked: false,
    }));

    setChests(newChests);
    setScore(0);
    setCorrectCount(0);
    setTimeLeft(config.duration);
    setGameStarted(true);
    setGameOver(false);
  }, [config]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver]);

  // Randomly reveal chests
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const revealInterval = setInterval(() => {
      setChests((prev) =>
        prev.map((chest) => ({
          ...chest,
          revealed: Math.random() > 0.7,
        }))
      );
    }, 2000);

    return () => clearInterval(revealInterval);
  }, [gameStarted, gameOver]);

  const handleChestClick = (id: number) => {
    if (gameOver || chests[id].clicked) return;

    const chest = chests[id];
    setChests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, clicked: true } : c))
    );

    if (chest.hasGem) {
      setScore((prev) => prev + config.gemsPerCorrect);
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleFinish = () => {
    const gemsEarned = Math.floor(score / 10);
    addGems(gemsEarned);

    completeTask({
      taskId: 'treasure',
      taskName: 'Treasure Hunt',
      score,
      gemsEarned,
      accuracy: (correctCount / config.chests) * 100,
      completedAt: new Date().toISOString(),
    });

    navigate('/');
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-2xl">
          <Card className="p-8 bg-white">
            <h1 className="font-display text-4xl font-bold text-foreground mb-6">
              Treasure Hunt
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Identify real gems among changing treasure chests. Stay focused and click on
              the chests that contain gems!
            </p>

            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Select Difficulty
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  {(Object.keys(DIFFICULTIES) as Array<keyof typeof DIFFICULTIES>).map(
                    (level) => (
                      <Button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`py-6 text-lg font-bold capitalize transition-all ${
                          difficulty === level
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {level}
                      </Button>
                    )
                  )}
                </div>
              </div>

              <div className="bg-secondary/10 p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Game Settings:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Chests: {config.chests}</li>
                  <li>Time Limit: {config.duration} seconds</li>
                  <li>Points per Gem: {config.gemsPerCorrect}</li>
                </ul>
              </div>

              <Button
                onClick={initializeGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold"
              >
                Start Game
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const gemsEarned = Math.floor(score / 10);
    const accuracy = (correctCount / config.chests) * 100;

    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-2xl">
          <Card className="p-8 bg-white text-center">
            <h1 className="font-display text-4xl font-bold text-foreground mb-6">
              Game Over!
            </h1>

            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="font-display text-5xl font-bold text-primary">{score}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Gems Found</p>
                  <p className="font-display text-3xl font-bold text-accent">
                    {correctCount}
                  </p>
                </div>
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    {accuracy.toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Gem className="w-6 h-6" fill="currentColor" />
                  <span className="font-display text-2xl font-bold">
                    +{gemsEarned} Gems Earned!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setGameStarted(false);
                  setDifficulty('easy');
                }}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </Button>
              <Button
                onClick={handleFinish}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                Finish & Return Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container">
        {/* Game Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Treasure Hunt
            </h1>
            <p className="text-muted-foreground">Find the gems!</p>
          </div>
          <div className="flex gap-6">
            <Card className="p-4 bg-white">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-display text-2xl font-bold text-primary">{score}</p>
            </Card>
            <Card className="p-4 bg-white">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-display text-2xl font-bold text-accent">{timeLeft}s</p>
            </Card>
          </div>
        </div>

        {/* Game Grid */}
        <Card className="p-8 bg-white">
          <div
            className={`grid gap-4 mb-8`}
            style={{
              gridTemplateColumns: `repeat(${Math.min(config.chests, 4)}, 1fr)`,
            }}
          >
            {chests.map((chest) => (
              <button
                key={chest.id}
                onClick={() => handleChestClick(chest.id)}
                disabled={chest.clicked || gameOver}
                className={`aspect-square rounded-lg font-display text-4xl font-bold transition-all transform hover:scale-105 ${
                  chest.clicked
                    ? chest.hasGem
                      ? 'bg-gradient-to-br from-yellow-300 to-orange-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                    : chest.revealed
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600 text-white hover:shadow-lg'
                }`}
              >
                {chest.clicked && chest.hasGem && <Gem className="w-12 h-12 mx-auto" />}
                {chest.clicked && !chest.hasGem && '✗'}
              </button>
            ))}
          </div>

          <Button
            onClick={handleFinish}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6"
          >
            Finish Game
          </Button>
        </Card>
      </div>
    </div>
  );
}
