import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { POST_SLUGS_QUERY, CATEGORY_SLUGS_QUERY } from "@/sanity/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  
  const [postSlugs, categorySlugs] = await Promise.all([
    client.fetch<string[]>(POST_SLUGS_QUERY),
    client.fetch<string[]>(CATEGORY_SLUGS_QUERY),
  ]);

  return [
    { url: baseUrl, lastModified: new Date() },
    ...postSlugs.map((slug: string) => ({ 
      url: `${baseUrl}/posts/${slug}`, 
      lastModified: new Date() 
    })),
    ...categorySlugs.map((slug: string) => ({ 
      url: `${baseUrl}/categories/${slug}`, 
      lastModified: new Date() 
    })),
  ];
}