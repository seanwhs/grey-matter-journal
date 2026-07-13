import { notFound } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { CATEGORY_QUERY, CATEGORY_SLUGS_QUERY, POSTS_BY_CATEGORY_QUERY } from "@/sanity/lib/queries";
import type { Category, Post } from "@/sanity/lib/types";
import PostCard from "@/components/PostCard";

export const revalidate = 60;
type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(CATEGORY_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = await client.fetch<Category>(CATEGORY_QUERY, { slug });
  return category ? { title: `${category.title} — My Blog` } : {};
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await client.fetch<Category>(CATEGORY_QUERY, { slug });
  if (!category) notFound();

  const posts = await client.fetch<Post[]>(POSTS_BY_CATEGORY_QUERY, { category: slug });

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-4xl font-bold tracking-tight">{category.title}</h1>
      {category.description && <p className="mt-2 text-gray-600 dark:text-gray-300">{category.description}</p>}
      
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </main>
  );
}
