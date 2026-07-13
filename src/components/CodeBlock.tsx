"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Client component that renders syntax-highlighted code
// Used by PortableTextComponents to render custom code blocks from Sanity
export default function CodeBlock({
  language,
  code,
}: {
  language?: string;
  code: string;
}) {
  return (
    <div className="overflow-x-auto">
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{ borderRadius: "0.5rem", padding: "1rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
