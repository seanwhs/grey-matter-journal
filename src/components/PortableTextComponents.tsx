import Image from "next/image";
import type { PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import CodeBlock from "./CodeBlock";

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <div className="my-8">
        <Image
          src={urlForImage(value).width(1200).url()}
          alt={value.alt || " "}
          width={1200}
          height={675}
          className="rounded-lg w-full h-auto"
        />
      </div>
    ),
    codeBlock: ({ value }) => (
      <div className="my-6">
        <CodeBlock language={value.language} code={value.code} />
      </div>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
      >
        {children}
      </a>
    ),
  },
  block: {
    h1: ({ children }) => <h1 className="mt-8 text-2xl font-bold sm:text-3xl">{children}</h1>,
    h2: ({ children }) => <h2 className="mt-8 text-xl font-bold sm:text-2xl">{children}</h2>,
    h3: ({ children }) => <h3 className="mt-6 text-lg font-bold sm:text-xl">{children}</h3>,
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300">
        {children}
      </blockquote>
    ),
  },
};
