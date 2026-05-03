import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GameProvider } from "@/contexts/GameContext";
import { GameHeader } from "@/components/GameHeader";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import TreasureGame from "@/pages/TreasureGame";
import AntiSaccadeTask from "@/pages/AntiSaccadeTask";
import ContinuousPerformanceTest from "@/pages/ContinuousPerformanceTest";
import DelayedSaccadeTask from "@/pages/DelayedSaccadeTask";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/task/treasure"} component={TreasureGame} />
      <Route path={"/task/antisaccade"} component={AntiSaccadeTask} />
      <Route path={"/task/cpt"} component={ContinuousPerformanceTest} />
      <Route path={"/task/delayedsaccade"} component={DelayedSaccadeTask} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <GameProvider>
          <TooltipProvider>
            <Toaster />
            <GameHeader />
            <Router />
          </TooltipProvider>
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
