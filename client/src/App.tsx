import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import GuestDetail from "./pages/GuestDetail";
import Guests from "./pages/Guests";
import Home from "./pages/Home";
import ZhenbenShi from "./pages/ZhenbenShi";
import Books from "./pages/Books";
import Collab from "./pages/Collab";
import CreatorCollab from "./pages/CreatorCollab";
import { useEffect } from "react";
import { useLocation } from "wouter";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/guests/:slug"}>
          {params => <GuestDetail slug={params.slug} />}
        </Route>
        <Route path={"/guests"} component={Guests} />
        <Route path={"/zbs"} component={ZhenbenShi} />
        <Route path={"/book"} component={Books} />
        <Route path={"/zh/collab/creators"} component={CreatorCollab} />
        <Route path={"/zh/collab"} component={Collab} />
        <Route path={"/collab/creators"} component={CreatorCollab} />
        <Route path={"/collab"} component={Collab} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider defaultLang="en">
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <Toaster />
            <Router />
            <Analytics />
          </TooltipProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
