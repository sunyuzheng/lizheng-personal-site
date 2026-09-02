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
import EnterpriseTraining from "./pages/EnterpriseTraining";
import About from "./pages/About";
import Podcast from "./pages/Podcast";
import GuestInvitation from "./pages/GuestInvitation";
import Decks from "./pages/Decks";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "wouter";
import type { Lang } from "./contexts/LanguageContext";

const HomeExperiment = lazy(() => import("./pages/HomeExperiment"));
const HomeExperimentEmil = lazy(() => import("./pages/HomeExperimentEmil"));
const AieShanghaiDeck = lazy(() => import("./pages/AieShanghaiDeck"));

function VercelExperimentRoute() {
  return (
    <Suspense fallback={null}>
      <HomeExperiment />
    </Suspense>
  );
}

function EmilExperimentRoute() {
  return (
    <Suspense fallback={null}>
      <HomeExperimentEmil />
    </Suspense>
  );
}

function AieShanghaiDeckRoute() {
  return (
    <Suspense fallback={<div className="h-[100svh] bg-[#0f2f1d]" />}>
      <AieShanghaiDeck />
    </Suspense>
  );
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function Router() {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  if (hostname === "speaker.lizheng.ai") {
    return <GuestInvitation />;
  }

  const isPodcastHost = hostname === "podcast.lizheng.ai";

  if (isPodcastHost) {
    return <Podcast />;
  }

  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/zh"} component={Home} />
        <Route path={"/about"} component={About} />
        <Route path={"/zh/about"} component={About} />
        <Route path={"/guests/:slug"}>
          {params => <GuestDetail slug={params.slug} />}
        </Route>
        <Route path={"/guests"} component={Guests} />
        <Route path={"/zbs"} component={ZhenbenShi} />
        <Route path={"/podcast"} component={Podcast} />
        <Route path={"/speaker"} component={GuestInvitation} />
        <Route
          path={"/decks/aie-shanghai-2026"}
          component={AieShanghaiDeckRoute}
        />
        <Route path={"/decks"} component={Decks} />
        <Route path={"/en/decks"} component={Decks} />
        <Route path={"/experiment/vercel"} component={VercelExperimentRoute} />
        <Route
          path={"/zh/experiment/vercel"}
          component={VercelExperimentRoute}
        />
        <Route path={"/experiment/emil"} component={EmilExperimentRoute} />
        <Route path={"/zh/experiment/emil"} component={EmilExperimentRoute} />
        <Route path={"/book"} component={Books} />
        <Route path={"/zh/book"} component={Books} />
        <Route path={"/zh/collab/creators"} component={CreatorCollab} />
        <Route path={"/zh/collab/enterprise"} component={EnterpriseTraining} />
        <Route path={"/zh/collab"} component={Collab} />
        <Route path={"/collab/creators"} component={CreatorCollab} />
        <Route path={"/collab/enterprise"} component={EnterpriseTraining} />
        <Route path={"/collab"} component={Collab} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

interface AppProps {
  defaultLang?: Lang;
}

function App({ defaultLang = "en" }: AppProps) {
  return (
    <ErrorBoundary>
      <LanguageProvider defaultLang={defaultLang}>
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
