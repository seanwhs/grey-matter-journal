import { groq } from "next-sanity";

// Homepage + listing pages — fetch all posts with author + categories resolved
export const POSTS_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
    author->{name, slug, image},
    categories[]->{title, slug}
  }
`;

// Single post detail — fetch everything including body
export const POST_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ..., author->{name, slug, image}, categories[]->{title, slug}
  }
`;

// Build static paths for ISR — all slugs for posts
export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

// Author detail page
export const AUTHOR_QUERY = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id, name, slug, image, bio
  }
`;

// Build static paths for author pages
export const AUTHOR_SLUGS_QUERY = groq`
  *[_type == "author" && defined(slug.current)][].slug.current
`;

// Posts filtered by a specific author
export const POSTS_BY_AUTHOR_QUERY = groq`
  *[_type == "post" && author->slug.current == $slug] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
    author->{name, slug, image},
    categories[]->{title, slug}
  }
`;

// Category detail page
export const CATEGORY_QUERY = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id, title, slug, description
  }
`;

// Build static paths for category pages
export const CATEGORY_SLUGS_QUERY = groq`
  *[_type == "category" && defined(slug.current)][].slug.current
`;

// All categories for navigation / sidebar
export const CATEGORIES_QUERY = groq`
  *[_type == "category"] {
    title,
    slug
  }
`;

// Posts filtered by a specific category
export const POSTS_BY_CATEGORY_QUERY = groq`
  *[_type == "post" && references(*[_type=="category" && slug.current == $category]._id)] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
    author->{name, slug, image},
    categories[]->{title, slug}
  }
`;

// Approved comments for a given post, ordered chronologically
export const COMMENTS_BY_POST_QUERY = groq`
  *[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt asc) {
    _id, userId, userName, userImageUrl, text, createdAt
  }
`;
