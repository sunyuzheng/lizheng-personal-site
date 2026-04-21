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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/guests/:slug"}>
        {params => <GuestDetail slug={params.slug} />}
      </Route>
      <Route path={"/guests"} component={Guests} />
      <Route path={"/zbs"} component={ZhenbenShi} />
      <Route path={"/book"} component={ZhenbenShi} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

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
