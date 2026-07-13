import { type SchemaTypeDefinition } from "sanity";

import { post } from "./post";
import { author } from "./author";
import { category } from "./category";
import { blockContent } from "./blockContent";
import { comment } from "./comment";

// Aggregates all document & object types for the Sanity Studio schema registry
export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, author, category, blockContent, comment],
};
