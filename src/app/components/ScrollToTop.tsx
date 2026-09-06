import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router";

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  // useLayoutEffect runs synchronously before browser paint
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.body.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  // Secondary effect to ensure async content expansion also stays at top
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname, search]);

  return null;
}
