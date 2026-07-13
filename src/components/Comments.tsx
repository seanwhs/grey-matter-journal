import Image from "next/image";
import { Show, SignInButton } from "@clerk/nextjs";
import { client } from "@/sanity/lib/client";
import { COMMENTS_BY_POST_QUERY } from "@/sanity/lib/queries";
import { submitComment } from "@/app/actions/comments";
import { urlForImage } from "@/sanity/lib/image";
import type { Comment } from "@/sanity/lib/types";

export default async function Comments({ postId, postSlug }: { postId: string, postSlug: string }) {
  const comments = await client.fetch<Comment[]>(COMMENTS_BY_POST_QUERY, { postId });

  return (
    <section className="mt-16 border-t pt-8">
      <h2 className="text-2xl font-semibold">Comments ({comments.length})</h2>

      <div className="mt-8 space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-3">
            {comment.userImageUrl && (
              <Image
                src={comment.userImageUrl}
                alt={comment.userName}
                width={36}
                height={36}
                className="mt-1 h-9 w-9 flex-shrink-0 rounded-full"
              />
            )}
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{comment.userName}</span>
                <time className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </time>
              </div>
              <p className="mt-1 text-sm">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      <Show when="signed-in">
        <form action={submitComment} className="mt-6">
          <input type="hidden" name="postId" value={postId} />
          <input type="hidden" name="postSlug" value={postSlug} />
          <textarea
            name="text"
            required
            placeholder="Write a comment..."
            className="w-full rounded-lg border p-3 text-sm"
            rows={3}
          />
          <button type="submit" className="mt-2 rounded bg-black px-4 py-2 text-sm text-white">
            Post Comment
          </button>
        </form>
      </Show>

      <Show when="signed-out">
        <div className="mt-6 text-sm">
          <SignInButton mode="modal">
            <button className="font-medium underline">Sign in</button>
          </SignInButton> to leave a comment.
        </div>
      </Show>
    </section>
  );
}
