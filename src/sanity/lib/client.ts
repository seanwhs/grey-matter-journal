import { createClient } from "next-sanity";

// Public read-only Sanity client — fetches published content for the frontend
// Uses CDN in production for faster cache-backed reads
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: process.env.NODE_ENV === "production",
});
