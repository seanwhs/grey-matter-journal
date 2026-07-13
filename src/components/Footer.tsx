import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 sm:flex-row sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} Greymatter Journal. All rights reserved.
        </p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}