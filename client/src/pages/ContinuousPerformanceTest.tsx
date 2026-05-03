import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Zap, RotateCcw } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface Trial {
  id: number;
  isTarget: boolean;
  responded: boolean;
  correct: boolean;
  reactionTime: number;
}

export default function ContinuousPerformanceTest() {
  const [, navigate] = useLocation();
  const { completeTask, addGems } = useGame();
  const [gameStarted, setGameStarted] = useState(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [score, setScore] = useState(0);
  const [showStimulus, setShowStimulus] = useState(false);
  const [stimulusType, setStimulusType] = useState<'target' | 'nontarget'>('target');
  const [startTime, setStartTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState('');

  const TOTAL_TRIALS = 100;
  const TARGET_RATIO = 0.4; // 40% targets, 60% non-targets

  const initializeGame = useCallback(() => {
    const newTrials: Trial[] = Array.from({ length: TOTAL_TRIALS }, (_, i) => ({
      id: i,
      isTarget: Math.random() < TARGET_RATIO,
      responded: false,
      correct: false,
      reactionTime: 0,
    }));

    setTrials(newTrials);
    setCurrentTrial(0);
    setScore(0);
    setGameStarted(true);
    setGameOver(false);
  }, []);

  const presentStimulus = useCallback(() => {
    if (currentTrial >= TOTAL_TRIALS) {
      setGameOver(true);
      return;
    }

    setTimeout(() => {
      const trial = trials[currentTrial];
      setStimulusType(trial.isTarget ? 'target' : 'nontarget');
      setShowStimulus(true);
      setStartTime(Date.now());
      setFeedback('');

      // Auto-advance if no response after 1500ms
      setTimeout(() => {
        if (showStimulus) {
          handleNoResponse();
        }
      }, 1500);
    }, 500);
  }, [currentTrial, trials, showStimulus]);

  useEffect(() => {
    if (gameStarted && !gameOver && currentTrial < TOTAL_TRIALS) {
      presentStimulus();
    }
  }, [gameStarted, gameOver, currentTrial, presentStimulus]);

  const handleResponse = () => {
    if (!showStimulus) return;

    const trial = trials[currentTrial];
    const reactionTime = Date.now() - startTime;
    const correct = trial.isTarget;

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      responded: true,
      correct,
      reactionTime,
    };
    setTrials(updatedTrials);

    if (correct) {
      setScore((prev) => prev + 10);
      setFeedback('✓ Correct!');
    } else {
      setFeedback('✗ False Alarm');
    }

    setShowStimulus(false);
    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
    }, 500);
  };

  const handleNoResponse = () => {
    if (!showStimulus) return;

    const trial = trials[currentTrial];
    const correct = !trial.isTarget;

    const updatedTrials = [...trials];
    updatedTrials[currentTrial] = {
      ...trial,
      responded: false,
      correct,
      reactionTime: 0,
    };
    setTrials(updatedTrials);

    if (correct) {
      setScore((prev) => prev + 5);
      setFeedback('✓ Correct Rejection');
    } else {
      setFeedback('✗ Missed Target');
    }

    setShowStimulus(false);
    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
    }, 500);
  };

  const handleFinish = () => {
    const correctResponses = trials.filter((t) => t.correct).length;
    const accuracy = (correctResponses / TOTAL_TRIALS) * 100;
    const avgReactionTime =
      trials.filter((t) => t.reactionTime > 0).reduce((sum, t) => sum + t.reactionTime, 0) /
      trials.filter((t) => t.reactionTime > 0).length;
    const gemsEarned = Math.floor(score / 10);

    addGems(gemsEarned);
    completeTask({
      taskId: 'cpt',
      taskName: 'Continuous Performance Test',
      score,
      gemsEarned,
      accuracy,
      reactionTime: avgReactionTime || 0,
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
              Continuous Performance Test
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Test your sustained attention and impulse control. Respond quickly to target
              stimuli, but inhibit responses to non-target stimuli.
            </p>

            <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg mb-8">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                How to Play
              </h3>
              <ol className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>Watch for stimuli to appear on screen</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>
                    Click "RESPOND" when you see a <strong>RED square</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>
                    Do NOT respond to <strong>BLUE squares</strong>
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">4.</span>
                  <span>Complete {TOTAL_TRIALS} trials as quickly and accurately as possible</span>
                </li>
              </ol>
            </div>

            <Button
              onClick={initializeGame}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start CPT
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
              Test Complete!
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
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
        {/* Stimulus */}
        {showStimulus && (
          <div
            className={`w-32 h-32 rounded-lg shadow-2xl animate-pulse ${
              stimulusType === 'target'
                ? 'bg-gradient-to-br from-red-400 to-red-600'
                : 'bg-gradient-to-br from-blue-400 to-blue-600'
            }`}
          />
        )}

        {/* Feedback */}
        {feedback && (
          <div className="text-2xl font-bold text-center">
            <span className={feedback.includes('✓') ? 'text-green-600' : 'text-red-600'}>
              {feedback}
            </span>
          </div>
        )}

        {/* Response Button */}
        {showStimulus && (
          <Button
            onClick={handleResponse}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-12 py-8 text-2xl font-bold rounded-lg"
          >
            RESPOND
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center bg-white rounded-lg shadow-lg p-4">
        <p className="text-sm text-muted-foreground">
          {showStimulus
            ? `${stimulusType === 'target' ? 'RED = RESPOND' : 'BLUE = DO NOT RESPOND'}`
            : 'Waiting for stimulus...'}
        </p>
      </div>
    </div>
  );
}
