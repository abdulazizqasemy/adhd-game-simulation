import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Clock, RotateCcw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface Trial {
  id: number;
  targetPosition: { x: number; y: number };
  delayDuration: number;
  userResponse: { x: number; y: number } | null;
  correct: boolean;
  accuracy: number;
}

export default function DelayedSaccadeTask() {
  const [, navigate] = useLocation();
  const { completeTask, addGems } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'fixation' | 'stimulus' | 'delay' | 'response'>('fixation');
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [delayTimeLeft, setDelayTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  const TOTAL_TRIALS = 15;
  const DELAYS = [1000, 3000, 5000];
  const POSITIONS = [
    { x: 150, y: 150 },
    { x: 150, y: -150 },
    { x: -150, y: 150 },
    { x: -150, y: -150 },
  ];

  const initializeGame = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const newTrials: Trial[] = Array.from({ length: TOTAL_TRIALS }, (_, i) => {
      const posOffset = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
      return {
        id: i,
        targetPosition: {
          x: centerX + posOffset.x,
          y: centerY + posOffset.y,
        },
        delayDuration: DELAYS[Math.floor(Math.random() * DELAYS.length)],
        userResponse: null,
        correct: false,
        accuracy: 0,
      };
    });

    setTrials(newTrials);
    setCurrentTrial(0);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
    setPhase('fixation');
  }, []);

  // Phase management
  useEffect(() => {
    if (!gameStarted || gameOver || currentTrial >= TOTAL_TRIALS) return;

    const trial = trials[currentTrial];

    if (phase === 'fixation') {
      const timer = setTimeout(() => setPhase('stimulus'), 500);
      return () => clearTimeout(timer);
    }

    if (phase === 'stimulus') {
      setTargetPos(trial.targetPosition);
      const timer = setTimeout(() => setPhase('delay'), 100);
      return () => clearTimeout(timer);
    }

    if (phase === 'delay') {
      setDelayTimeLeft(trial.delayDuration);
      const timer = setTimeout(() => setPhase('response'), trial.delayDuration);
      return () => clearTimeout(timer);
    }

    if (phase === 'response') {
      setFeedback('Click where the dot was');
    }
  }, [phase, gameStarted, gameOver, currentTrial, trials]);

  // Delay countdown
  useEffect(() => {
    if (phase !== 'delay' || delayTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setDelayTimeLeft((prev) => Math.max(0, prev - 100));
    }, 100);

    return () => clearInterval(timer);
  }, [phase, delayTimeLeft]);

  const handleResponseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== 'response') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const trial = trials[currentTrial];
    const distance = Math.sqrt(
      Math.pow(clickX - trial.targetPosition.x, 2) +
        Math.pow(clickY - trial.targetPosition.y, 2)
    );

    const accuracy = Math.max(0, 100 - distance / 2);
    const correct = accuracy > 70;

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      userResponse: { x: clickX, y: clickY },
      correct,
      accuracy,
    };
    setTrials(updatedTrials);

    if (correct) {
      setScore((prev) => prev + 10);
      setFeedback('✓ Accurate!');
    } else {
      setFeedback('✗ Try to be more precise');
    }

    setTimeout(() => {
      if (currentTrial + 1 >= TOTAL_TRIALS) {
        setGameOver(true);
      } else {
        setCurrentTrial((prev) => prev + 1);
        setPhase('fixation');
        setFeedback('');
      }
    }, 1000);
  };

  const handleFinish = () => {
    const correctResponses = trials.filter((t) => t.correct).length;
    const accuracy = (correctResponses / TOTAL_TRIALS) * 100;
    const avgAccuracy = trials.reduce((sum, t) => sum + t.accuracy, 0) / TOTAL_TRIALS;
    const gemsEarned = Math.floor(score / 10);

    addGems(gemsEarned);
    completeTask({
      taskId: 'delayedsaccade',
      taskName: 'Delayed-Saccade Task',
      score,
      gemsEarned,
      accuracy: avgAccuracy,
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
              Delayed-Saccade Task
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              A dot will appear briefly, then disappear. After a delay, click where you
              remember the dot was. This tests your spatial working memory and inhibitory
              control.
            </p>

            <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-lg mb-8">
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
                  <span>A green dot will appear briefly on the screen</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>The dot disappears and you wait for a delay (1-5 seconds)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Click where you remember the dot was</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">5.</span>
                  <span>Complete {TOTAL_TRIALS} trials</span>
                </li>
              </ol>
            </div>

            <Button
              onClick={initializeGame}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold"
            >
              <Clock className="w-5 h-5 mr-2" />
              Start Delayed-Saccade Task
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (gameOver) {
    const correctResponses = trials.filter((t) => t.correct).length;
    const accuracy = (correctResponses / TOTAL_TRIALS) * 100;
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
                  <p className="text-sm text-muted-foreground">Correct</p>
                  <p className="font-display text-3xl font-bold text-primary">
                    {correctResponses}/{TOTAL_TRIALS}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary to-accent text-white p-6 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-6 h-6" />
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
    <div
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center p-4 cursor-crosshair"
      onClick={handleResponseClick}
    >
      {/* Header */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground">Trial</p>
        <p className="font-display text-2xl font-bold text-primary">
          {currentTrial + 1}/{TOTAL_TRIALS}
        </p>
      </div>

      {/* Score */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground">Score</p>
        <p className="font-display text-2xl font-bold text-primary">{score}</p>
      </div>

      {/* Main Game Area */}
      <div className="w-full h-screen flex flex-col items-center justify-center gap-8">
        {/* Fixation Point */}
        {(phase === 'fixation' || phase === 'stimulus') && (
          <div className="absolute w-4 h-4 bg-black rounded-full" />
        )}

        {/* Target Dot (Stimulus Phase) */}
        {phase === 'stimulus' && (
          <div
            className="absolute w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-2xl animate-pulse"
            style={{
              left: `${targetPos.x}px`,
              top: `${targetPos.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Delay Phase */}
        {phase === 'delay' && (
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Remember the position...</p>
            <div className="text-4xl font-bold text-primary">
              {(delayTimeLeft / 1000).toFixed(1)}s
            </div>
          </div>
        )}

        {/* Response Phase */}
        {phase === 'response' && (
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground mb-4">
              Click where the dot was
            </p>
            {feedback && (
              <p
                className={`text-xl font-bold ${
                  feedback.includes('✓') ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {feedback}
              </p>
            )}
          </div>
        )}

        {/* User Response Marker (if in response phase and clicked) */}
        {phase === 'response' &&
          trials[currentTrial]?.userResponse && (
            <div
              className="absolute w-8 h-8 border-4 border-blue-500 rounded-full"
              style={{
                left: `${trials[currentTrial].userResponse?.x}px`,
                top: `${trials[currentTrial].userResponse?.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground">
          {phase === 'fixation' && 'Focus on center...'}
          {phase === 'stimulus' && 'Watch the dot...'}
          {phase === 'delay' && 'Remember the position...'}
          {phase === 'response' && 'Click to respond'}
        </p>
      </div>
    </div>
  );
}
