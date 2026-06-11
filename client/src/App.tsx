import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProcedurePage from "./pages/ProcedurePage";
import HistoryPage from "./pages/HistoryPage";
import TimersPage from "./pages/TimersPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/procedimento/:id" component={ProcedurePage} />
      <Route path="/historico" component={HistoryPage} />
      <Route path="/timers" component={TimersPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
