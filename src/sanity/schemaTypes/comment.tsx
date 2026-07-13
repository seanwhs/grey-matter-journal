import { defineField, defineType } from "sanity";

// Using a custom SVG component to avoid @sanity/icons resolution issues
const ChatIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const comment = defineType({
  name: "comment",
  title: "Comment",
  type: "document",
  icon: ChatIcon,
  fields: [
    defineField({ name: "post", type: "reference", to: [{ type: "post" }] }),
    defineField({ name: "userId", type: "string" }),
    defineField({ name: "userName", type: "string" }),
    defineField({ name: "userImageUrl", type: "url" }),
    defineField({ name: "text", type: "text" }),
    defineField({ name: "approved", type: "boolean", initialValue: true }),
    defineField({ name: "createdAt", type: "datetime" }),
  ],
});