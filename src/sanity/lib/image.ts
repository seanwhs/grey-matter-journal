import { createImageUrlBuilder } from "@sanity/image-url";
import { type SanityImageSource } from "@sanity/image-url";
import { client } from "./client";

// Builds Sanity image-transformation URLs (e.g. ?w=600&h=400&fit=crop)
// Callers chain .width(w).height(h).url() to generate full CDN URLs
const builder = createImageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
