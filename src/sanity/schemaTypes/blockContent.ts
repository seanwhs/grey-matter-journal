import { defineType, defineArrayMember } from "sanity";
import { ImageIcon } from "@sanity/icons/Image";

export const blockContent = defineType({
  title: "Block Content",
  name: "blockContent",
  type: "array",
  of: [
    defineArrayMember({
      title: "Block",
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H1", value: "h1" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "H4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" },
        ],
        annotations: [
          {
            title: "URL",
            name: "link",
            type: "object",
            fields: [
              {
                title: "URL",
                name: "href",
                type: "url",
              },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative text",
          description: "Important for SEO and accessibility.",
        },
      ],
    }),
    defineArrayMember({
      type: "object",
      name: "codeBlock",
      title: "Code Block",
      fields: [
        {
          name: "language",
          title: "Language",
          type: "string",
          options: {
            list: [
              "javascript", "typescript", "jsx", "tsx", "bash",
              "json", "css", "html", "python",
            ],
          },
        },
        {
          name: "code",
          title: "Code",
          type: "text",
          rows: 10,
        },
      ],
      preview: {
        select: { language: "language", code: "code" },
        prepare({ language, code }) {
          return {
            title: `Code (${language || "plain"})`,
            subtitle: code?.slice(0, 40),
          };
        },
      },
    }),
  ],
});