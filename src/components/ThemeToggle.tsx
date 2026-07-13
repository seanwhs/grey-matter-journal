"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore, useCallback } from "react";

export default function ThemeToggle() {
  // Removed 'theme' from here
  const { setTheme, resolvedTheme } = useTheme();

  const isMounted = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => true,
    () => false
  );

  if (!isMounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-sm dark:border-gray-700"
    >
      {resolvedTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}