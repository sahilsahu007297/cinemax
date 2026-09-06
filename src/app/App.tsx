import { MemoryRouter, Routes, Route, Navigate } from "react-router";
import { Layout } from "./components/Layout";
import { ScrollToTop } from "./components/ScrollToTop";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import Watchlist from "./pages/Watchlist";
import TitleDetail from "./pages/TitleDetail";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Providers from "./pages/Providers";
import SignIn from "./pages/SignIn";
import HindiHub from "./pages/HindiHub";

export default function App() {
  return (
    <MemoryRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse heading="Browse Movies" filterType="Movie" />} />
          <Route path="/series" element={<Browse heading="TV Series" filterType="Series" />} />
          <Route path="/hindi" element={<HindiHub />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/watch-later" element={<Watchlist heading="Watch Later" />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/title/:id" element={<TitleDetail />} />
          <Route path="/watch/:id" element={<Watch />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}
