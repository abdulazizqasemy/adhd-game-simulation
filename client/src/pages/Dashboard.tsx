import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Brain, Zap, Target, Eye, Clock, BarChart3 } from 'lucide-react';
import { useLocation } from 'wouter';

const tasks = [
  {
    id: 'treasure',
    name: 'Treasure Hunt',
    description: 'Identify real gems among changing treasure chests',
    icon: Target,
    color: 'from-yellow-400 to-orange-500',
    skills: ['Sustained Attention', 'Working Memory'],
    difficulty: 'Easy',
  },
  {
    id: 'antisaccade',
    name: 'Anti-Saccade Task',
    description: 'Look opposite to where the target appears',
    icon: Eye,
    color: 'from-blue-400 to-cyan-500',
    skills: ['Executive Inhibition', 'Working Memory'],
    difficulty: 'Medium',
  },
  {
    id: 'delayedsaccade',
    name: 'Delayed-Saccade Task',
    description: 'Remember and recall target positions after delays',
    icon: Clock,
    color: 'from-purple-400 to-pink-500',
    skills: ['Inhibitory Control', 'Spatial Memory'],
    difficulty: 'Medium',
  },
  {
    id: 'cpt',
    name: 'Continuous Performance',
    description: 'Quick reaction test - respond to targets only',
    icon: Zap,
    color: 'from-red-400 to-orange-500',
    skills: ['Sustained Attention', 'Impulse Control'],
    difficulty: 'Hard',
  },
];

const taskRoutes: Record<string, string> = {
  treasure: '/task/treasure',
  antisaccade: '/task/antisaccade',
  delayedsaccade: '/task/delayedsaccade',
  cpt: '/task/cpt',
};

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { stats } = useGame();

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-12 px-4">
        <div className="container">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold text-foreground">
                Welcome, Warrior!
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Your mission: Complete cognitive challenges to save your homeland
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4 bg-white">
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
              <p className="text-3xl font-bold text-primary">{stats.tasksCompleted}</p>
            </Card>
            <Card className="p-4 bg-white">
              <p className="text-sm text-muted-foreground">Total Score</p>
              <p className="text-3xl font-bold text-accent">{stats.totalScore}</p>
            </Card>
            <Card className="p-4 bg-white">
              <p className="text-sm text-muted-foreground">Current Level</p>
              <p className="text-3xl font-bold text-primary">{stats.currentLevel}</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Available Tasks */}
      <section className="py-12 px-4">
        <div className="container">
          <h2 className="font-display text-3xl font-bold mb-8 text-foreground">
            Choose Your Challenge
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <Card
                  key={task.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(taskRoutes[task.id])}
                >
                  {/* Gradient Header */}
                  <div className={`bg-gradient-to-r ${task.color} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-display text-2xl font-bold">{task.name}</h3>
                        <p className="text-sm opacity-90 mt-1">{task.description}</p>
                      </div>
                      <Icon className="w-8 h-8 opacity-80" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        Skills Trained
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {task.skills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-secondary text-secondary-foreground text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-sm font-semibold text-foreground">
                        Difficulty: {task.difficulty}
                      </span>
                      <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(taskRoutes[task.id]);
                        }}
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Progress Section */}
      <section className="py-12 px-4 bg-secondary/5">
        <div className="container">
          <h2 className="font-display text-3xl font-bold mb-8 text-foreground">
            Your Progress
          </h2>

          <Card className="p-8 bg-white">
            <div className="flex items-center gap-6">
              <BarChart3 className="w-12 h-12 text-accent" />
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  Level {stats.currentLevel}
                </h3>
                <p className="text-muted-foreground mt-2">
                  Complete {5 - (stats.tasksCompleted % 5)} more tasks to reach the next level
                </p>
                <div className="mt-4 bg-border rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-500"
                    style={{
                      width: `${((stats.tasksCompleted % 5) / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
