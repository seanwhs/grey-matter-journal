import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/sanity/lib/image";
import type { Post } from "@/sanity/lib/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug.current}`} className="group block rounded-xl border border-gray-200 p-4 transition hover:shadow-lg dark:border-gray-700">
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        {post.mainImage && (
          <Image
            src={urlForImage(post.mainImage).width(600).height(400).url()}
            // TypeScript now recognizes .alt here
            alt={post.mainImage.alt || post.title} 
            fill
            className="object-cover transition group-hover:scale-105"
          />
        )}
        {post.isMembersOnly && (
          <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
            Members Only
          </span>
        )}
      </div>
      <h2 className="mt-4 text-xl font-semibold group-hover:underline">{post.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
    </Link>
  );
}