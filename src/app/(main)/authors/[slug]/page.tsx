import { notFound } from "next/navigation";
import Image from "next/image";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { AUTHOR_QUERY, AUTHOR_SLUGS_QUERY, POSTS_BY_AUTHOR_QUERY } from "@/sanity/lib/queries";
import type { Author, Post } from "@/sanity/lib/types";
import PostCard from "@/components/PostCard";

export const revalidate = 60;
type PageProps = { params: Promise<{ slug: string }> };

// ISR: pre-render all author pages at build time
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(AUTHOR_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await client.fetch<Author>(AUTHOR_QUERY, { slug });
  if (!author) notFound();

  const posts = await client.fetch<Post[]>(POSTS_BY_AUTHOR_QUERY, { slug });

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
        {author.image && (
          <div className="relative h-20 w-20 overflow-hidden rounded-full">
            <Image src={urlForImage(author.image).width(160).height(160).url()} alt={author.name} fill className="object-cover" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{author.name}</h1>
          <p className="mt-1 max-w-xl text-gray-600 dark:text-gray-300">{author.bio}</p>
        </div>
      </div>
      <h2 className="mt-12 text-2xl font-semibold">Posts by {author.name}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => <PostCard key={post._id} post={post} />)}
      </div>
    </main>
  );
}
