import Link from "next/link";
import { client } from "@/sanity/lib/client";
import { CATEGORIES_QUERY } from "@/sanity/lib/queries";
import type { Category } from "@/sanity/lib/types";
import { HeaderAuth } from "./HeaderAuth";

export default async function Header() {
  const categories = await client.fetch<Category[]>(CATEGORIES_QUERY);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold">
          Greymatter Journal
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex gap-4 text-sm">
            {categories.map((cat) => (
              <Link
                key={cat.slug.current}
                href={`/categories/${cat.slug.current}`}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                {cat.title}
              </Link>
            ))}
          </nav>
          
          {/* Orchestrated Client Component */}
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}