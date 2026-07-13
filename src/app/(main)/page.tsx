import { client } from "@/sanity/lib/client";
import { POSTS_QUERY } from "@/sanity/lib/queries";
import PostCard from "@/components/PostCard";
import type { Post } from "@/sanity/lib/types";

export const revalidate = 60; // ISR: Refresh data at most once a minute

export default async function HomePage() {
  const posts = await client.fetch<Post[]>(POSTS_QUERY);

  return (
    <main className="mx-auto max-w-5xl px-4 py-20">
      {/* Hero Section */}
      <div className="text-center">
        {/* Removed redundant brand name; focused on the mission */}
        <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl">
          Building better systems through thoughtful engineering.
        </h1>
        
        <p className="mt-6 text-xl text-gray-600 dark:text-gray-400 font-light tracking-tight max-w-2xl mx-auto">
          Insights on AI, architecture, clean code, and the art of building software that scales.
        </p>

        {/* Optional: Keep or remove the tech stack line based on preference */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          Built with Next.js 16 • Tailwind v4 • Sanity • Clerk
        </p>
      </div>

      {/* Blog Grid Section */}
      <section className="mt-20">
        <h2 className="text-2xl font-bold mb-10">Latest Posts</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}