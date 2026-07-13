import { createClient } from "next-sanity";

// Authenticated Sanity client — only used in server actions for writes
// useCdn is always false to guarantee fresh writes, requires SANITY_API_WRITE_TOKEN
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
