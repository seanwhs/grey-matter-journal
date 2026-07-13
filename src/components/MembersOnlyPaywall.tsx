import { SignInButton, SignUpButton } from "@clerk/nextjs";

// Server component: shown in place of post body when a members-only post is viewed by a non-authenticated user
export default function MembersOnlyPaywall() {
  return (
    <div className="not-prose mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900 sm:p-8">
      <h3 className="text-xl font-semibold">This post is for members only</h3>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Sign in or create a free account to keep reading.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <SignInButton mode="modal">
          <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white dark:bg-white dark:text-black">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-full border border-gray-300 px-5 py-2 text-sm font-medium dark:border-gray-700">
            Create Account
          </button>
        </SignUpButton>
      </div>
    </div>
  );
}
