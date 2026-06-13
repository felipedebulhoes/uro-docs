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
import AtlasIndexPage from "./pages/AtlasIndexPage";
import AtlasProcedurePage from "./pages/AtlasProcedurePage";
import AtlasAdminPage from "./pages/AtlasAdminPage";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/procedimento/:id" component={ProcedurePage} />
      <Route path="/historico" component={HistoryPage} />
      <Route path="/timers" component={TimersPage} />
      <Route path="/atlas" component={AtlasIndexPage} />
      <Route path="/atlas/admin" component={AtlasAdminPage} />
      <Route path="/atlas/:id" component={AtlasProcedurePage} />
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
