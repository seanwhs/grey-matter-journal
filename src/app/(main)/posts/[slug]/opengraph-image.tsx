import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { POST_QUERY } from "@/sanity/lib/queries";
import type { Post } from "@/sanity/lib/types";

// 1. Force the runtime to 'nodejs' to avoid Edge compatibility issues with Sanity
export const runtime = "nodejs"; 
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const post = await client.fetch<Post>(POST_QUERY, { slug });

    if (!post) {
        return new ImageResponse(
            <div style={{ background: "black", color: "white", padding: 50 }}>Post not found</div>,
            { ...size }
        );
    }

    return new ImageResponse(
      (
        <div 
          style={{ 
            display: "flex", 
            flexDirection: "column",
            width: "100%", 
            height: "100%", 
            background: "#0f172a", 
            color: "white", 
            padding: "80px",
            justifyContent: "center"
          }}
        >
          <h1 style={{ fontSize: "64px", fontWeight: "bold" }}>
            {post.title}
          </h1>
        </div>
      ),
      { ...size }
    );
  } catch (err) {
    console.error("OG Image generation failed:", err);
    return new Response("Failed to generate image", { status: 500 });
  }
}