import { groq } from "next-sanity";

export const POSTS_QUERY = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
    author->{name, slug, image},
    categories[]->{title, slug}
  }
`;

export const POST_QUERY = groq`
  *[_type == "post" && slug.current == $slug][0] {
    ..., author->{name, slug, image}, categories[]->{title, slug}
  }
`;

export const POST_SLUGS_QUERY = groq`
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const AUTHOR_QUERY = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id, name, slug, image, bio
  }
`;

export const AUTHOR_SLUGS_QUERY = groq`
  *[_type == "author" && defined(slug.current)][].slug.current
`;

export const POSTS_BY_AUTHOR_QUERY = groq`
  *[_type == "post" && author->slug.current == $slug] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
    author->{name, slug, image},
    categories[]->{title, slug}
  }
`;

export const CATEGORY_QUERY = groq`
  *[_type == "category" && slug.current == $slug][0] {
    _id, title, slug, description
  }
`;

export const CATEGORY_SLUGS_QUERY = groq`
  *[_type == "category" && defined(slug.current)][].slug.current
`;

// src/sanity/lib/queries.ts

// Add this if it's missing:
export const CATEGORIES_QUERY = groq`
  *[_type == "category"] {
    title,
    slug
  }
`;

export const POSTS_BY_CATEGORY_QUERY = groq`
  *[_type == "post" && references(*[_type=="category" && slug.current == $category]._id)] | order(publishedAt desc) {
    _id, title, slug, excerpt, mainImage, publishedAt, isMembersOnly,
    author->{name, slug, image},
    categories[]->{title, slug}
  }
`;

export const COMMENTS_BY_POST_QUERY = groq`
  *[_type == "comment" && post._ref == $postId && approved == true] | order(createdAt asc) {
    _id, userId, userName, userImageUrl, text, createdAt
  }
`;
