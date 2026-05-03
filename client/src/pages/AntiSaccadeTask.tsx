import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Zap, RotateCcw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface Trial {
  id: number;
  targetPosition: 'left' | 'right';
  targetDistance: number;
  correct: boolean;
  reactionTime: number;
}

export default function AntiSaccadeTask() {
  const [, navigate] = useLocation();
  const { completeTask, addGems } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startTime, setStartTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const TOTAL_TRIALS = 20;
  const DISTANCES = [60, 120];

  const initializeGame = useCallback(() => {
    const newTrials: Trial[] = Array.from({ length: TOTAL_TRIALS }, (_, i) => ({
      id: i,
      targetPosition: Math.random() > 0.5 ? 'left' : 'right',
      targetDistance: DISTANCES[Math.floor(Math.random() * DISTANCES.length)],
      correct: false,
      reactionTime: 0,
    }));

    setTrials(newTrials);
    setCurrentTrial(0);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
  }, []);

  const startNextTrial = useCallback(() => {
    if (currentTrial >= TOTAL_TRIALS) {
      setGameOver(true);
      return;
    }

    setTimeout(() => {
      const trial = trials[currentTrial];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const x =
        trial.targetPosition === 'left'
          ? centerX - trial.targetDistance
          : centerX + trial.targetDistance;

      setTargetPos({ x, y: centerY });
      setShowTarget(true);
      setStartTime(Date.now());
    }, 1000);
  }, [currentTrial, trials]);

  useEffect(() => {
    if (gameStarted && !gameOver && currentTrial < TOTAL_TRIALS) {
      startNextTrial();
    }
  }, [gameStarted, gameOver, currentTrial, startNextTrial]);

  const handleResponse = (direction: 'left' | 'right') => {
    if (!showTarget) return;

    const trial = trials[currentTrial];
    const reactionTime = Date.now() - startTime;
    const correct = direction !== trial.targetPosition;

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      correct,
      reactionTime,
    };
    setTrials(updatedTrials);

    if (correct) {
      setScore((prev) => prev + 10);
    }

    setShowTarget(false);
    setCurrentTrial((prev) => prev + 1);
  };

  const handleFinish = () => {
    const accuracy = (score / (TOTAL_TRIALS * 10)) * 100;
    const avgReactionTime =
      trials.reduce((sum, t) => sum + t.reactionTime, 0) / TOTAL_TRIALS;
    const gemsEarned = Math.floor(score / 10);

    addGems(gemsEarned);
    completeTask({
      taskId: 'antisaccade',
      taskName: 'Anti-Saccade Task',
      score,
      gemsEarned,
      accuracy,
      reactionTime: avgReactionTime,
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
              Anti-Saccade Task
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              A target dot will appear on the screen. Your task is to look in the OPPOSITE
              direction. This tests your ability to inhibit automatic eye movements and
              control your impulses.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-8">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                How to Play
              </h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Focus on the center fixation point</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>A target dot will appear on the left or right</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>Click the button in the OPPOSITE direction</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>You will complete {TOTAL_TRIALS} trials</span>
                </li>
              </ol>
            </div>

            <Button
              onClick={initializeGame}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Anti-Saccade Task
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const accuracy = (score / (TOTAL_TRIALS * 10)) * 100;
    const gemsEarned = Math.floor(score / 10);

    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-2xl">
          <Card className="p-8 bg-white text-center">
            <h1 className="font-display text-4xl font-bold text-foreground mb-6">
              Task Complete!
            </h1>

            <div className="space-y-6 mb-8">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Total Score</p>
                <p className="font-display text-5xl font-bold text-primary">{score}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="font-display text-3xl font-bold text-accent">
                    {accuracy.toFixed(0)}%
                  </p>
                </div>
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Trials</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    {TOTAL_TRIALS}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-6 h-6" />
                  <span className="font-display text-2xl font-bold">
                    +{gemsEarned} Gems Earned!
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setGameStarted(false)}
                className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={handleFinish}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-6"
              >
                Return Home
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground">Trial</p>
        <p className="font-display text-2xl font-bold text-primary">
          {currentTrial + 1}/{TOTAL_TRIALS}
        </p>
      </div>

      {/* Main Game Area */}
      <div className="relative w-full h-screen flex items-center justify-center">
        {/* Fixation Point */}
        <div className="absolute w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg">
          <div className="absolute inset-1 bg-white rounded-full" />
        </div>

        {/* Target Dot */}
        {showTarget && (
          <div
            className="absolute w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-2xl animate-pulse"
            style={{
              left: `${targetPos.x}px`,
              top: `${targetPos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Response Buttons */}
        {showTarget && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-8">
            <Button
              onClick={() => handleResponse('left')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg font-bold rounded-lg"
            >
              ← LEFT
            </Button>
            <Button
              onClick={() => handleResponse('right')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg font-bold rounded-lg"
            >
              RIGHT →
            </Button>
          </div>
        )}
      </div>

      {/* Score Display */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground">Score</p>
        <p className="font-display text-2xl font-bold text-primary">{score}</p>
      </div>
    </div>
  );
}
