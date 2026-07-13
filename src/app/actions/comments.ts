"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/lib/writeClient";

export async function submitComment(formData: FormData) {
  const { userId } = await auth(); // MUST be awaited
  if (!userId) throw new Error("Unauthorized");

  const postId = formData.get("postId") as string;
  const postSlug = formData.get("postSlug") as string;
  const text = (formData.get("text") as string)?.trim();

  if (!text) throw new Error("Comment empty");

  const user = await currentUser(); // MUST be awaited
  await writeClient.create({
    _type: "comment",
    post: { _type: "reference", _ref: postId },
    userId,
    userName: user?.fullName || user?.username || "Anonymous",
    userImageUrl: user?.imageUrl || "",
    text,
    approved: true,
    createdAt: new Date().toISOString(),
  });

  revalidatePath(`/posts/${postSlug}`);
}
