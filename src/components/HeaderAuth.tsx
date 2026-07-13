"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

// Client component: renders theme toggle + Clerk auth buttons
// Split from Header to allow client-side interactivity without making the whole nav a client component
export const HeaderAuth = () => {
  return (
    <div className="flex items-center gap-4 border-l pl-6 dark:border-gray-700">
      <ThemeToggle />
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-full bg-black px-4 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black">
            Sign In
          </button>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
};
