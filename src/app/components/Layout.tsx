import { Outlet } from "react-router";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { VenetianPreloader } from "./VenetianPreloader";
import cinemaxLogo from "../../Cinemax Logo 1.png";

export function Layout() {
  return (
    <div className="dark min-h-screen w-full bg-[#08090c] text-white relative overflow-x-hidden">
      {/* Venetian Style Preloader with Staggered Blinds Reveal */}
      <VenetianPreloader />

      <div className="pointer-events-none fixed inset-0 cinema-grain" />
      <div className="relative flex min-h-screen flex-col">
        <Topbar />
        <main className="flex-1 pb-24 sm:pb-16 animate-fade-in">
          <Outlet />
        </main>
        {/* Mobile Bottom Navigation Dock */}
        <MobileNav />
        <footer className="px-6 lg:px-10 py-8 text-xs text-white/30 flex flex-wrap gap-x-6 gap-y-3 justify-between items-center border-t border-white/[0.04]">
          <div className="flex items-center gap-2.5">
            <img src={cinemaxLogo} alt="Cinemax" className="h-5 w-5 object-contain" />
            <span className="font-semibold text-white/70 tracking-wider">CINEMAX</span>
            <span>· © 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
          </div>
        </footer>
      </div>
    </div>
  );
}

