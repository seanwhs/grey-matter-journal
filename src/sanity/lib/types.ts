import { type PortableTextBlock } from "next-sanity";
import { type SanityImageSource } from "@sanity/image-url";

export interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  mainImage: SanityImageSource & { alt?: string }; 
  publishedAt: string;
  isMembersOnly: boolean;
  author: { 
    name: string; 
    slug: { current: string };
    image?: SanityImageSource 
  };
  categories: { 
    title: string; 
    slug: { current: string } 
  }[];
  body?: PortableTextBlock[];
}

// Add these exports to match your queries
export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: { current: string };
  image?: SanityImageSource;
  bio?: string;
}

export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userImageUrl: string;
  text: string;
  createdAt: string;
}