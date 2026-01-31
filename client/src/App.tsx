import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { AppStateProvider } from "./contexts/AppStateContext";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import SavedPapers from "./pages/SavedPapers";
import RecentSearches from "./pages/RecentSearches";
import Settings from "./pages/Settings";
import RatMode from "./pages/RatMode";
import PaperDetails from "./pages/PaperDetails";
import Community from "./pages/Community";
import NotFound from "./pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Landing page without layout */}
      <Route path="/" component={Landing} />
      
      {/* App routes with layout */}
      <Route path="/home">
        <Layout>
          <Home />
        </Layout>
      </Route>
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/saved">
        <Layout>
          <SavedPapers />
        </Layout>
      </Route>
      <Route path="/recent">
        <Layout>
          <RecentSearches />
        </Layout>
      </Route>
      <Route path="/settings">
        <Layout>
          <Settings />
        </Layout>
      </Route>
      <Route path="/paper/:id">
        <Layout>
          <PaperDetails />
        </Layout>
      </Route>
      <Route path="/community">
        <Layout>
          <Community />
        </Layout>
      </Route>
      
      {/* RAT Mode (Standalone Layout) */}
      <Route path="/rat-mode" component={RatMode} />
      
      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppStateProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AppStateProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
