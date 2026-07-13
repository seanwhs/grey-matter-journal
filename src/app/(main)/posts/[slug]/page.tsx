import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import { urlForImage } from "@/sanity/lib/image";
import { POST_QUERY, POST_SLUGS_QUERY } from "@/sanity/lib/queries";
import type { Post } from "@/sanity/lib/types";
import { portableTextComponents } from "@/components/PortableTextComponents";
import Comments from "@/components/Comments";
import MembersOnlyPaywall from "@/components/MembersOnlyPaywall";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(POST_SLUGS_QUERY);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await client.fetch<Post>(POST_QUERY, { slug });
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/posts/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [`/posts/${slug}/opengraph-image`],
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await client.fetch<Post>(POST_QUERY, { slug });

  if (!post) notFound();

  // Await the auth promise to retrieve the current user state
  const { userId } = await auth();
  const canViewFullContent = !post.isMembersOnly || Boolean(userId);

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{post.title}</h1>

      {post.author && (
        <div className="mt-4 flex items-center gap-3">
          {post.author.image && (
            <Image
              src={urlForImage(post.author.image).width(64).height(64).url()}
              alt={post.author.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <Link
              href={`/authors/${post.author.slug.current}`}
              className="font-medium text-gray-900 hover:underline dark:text-white"
            >
              {post.author.name}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}

      {post.mainImage && (
        <div className="relative mt-8 h-48 w-full overflow-hidden rounded-xl sm:h-64 lg:h-96">
          <Image
            src={urlForImage(post.mainImage).width(1200).height(675).url()}
            alt={post.mainImage.alt || post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <article className="prose prose-lg mt-10 max-w-none dark:prose-invert">
        {canViewFullContent ? (
          post.body && (
            <PortableText
              value={post.body}
              components={portableTextComponents}
            />
          )
        ) : (
          <MembersOnlyPaywall />
        )}
      </article>

      {/* Optionally gate comments as well */}
      {canViewFullContent && (
        <Comments postId={post._id} postSlug={post.slug.current} />
      )}
    </main>
  );
}