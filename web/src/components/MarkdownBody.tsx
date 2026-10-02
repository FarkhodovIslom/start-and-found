import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

export interface MarkdownBodyProps {
  /** Markdown source of a post. */
  body: string;
  className?: string;
}

/**
 * Element mapping of the rendered markdown.
 *
 * react-markdown escapes embedded HTML unless rehype-raw is enabled, and the
 * default URL transform drops unsafe protocols, so post bodies stay inert.
 */
const components: Components = {
  p: ({ children }) => <p className="leading-relaxed last:mb-0 [&:not(:last-child)]:mb-3">{children}</p>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="text-accent underline decoration-accent/40 underline-offset-2 break-words hover:decoration-accent"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="text-ink-4 line-through">{children}</del>,
  h1: ({ children }) => <h3 className="mt-4 mb-2 text-lg font-semibold text-ink">{children}</h3>,
  h2: ({ children }) => <h4 className="mt-4 mb-2 text-base font-semibold text-ink">{children}</h4>,
  h3: ({ children }) => <h5 className="mt-3 mb-2 text-sm font-semibold text-ink">{children}</h5>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-accent/40 pl-3 text-ink-3">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 text-[13px] leading-relaxed">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-4 border-line" />,
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-line bg-surface-2 px-2 py-1 text-left font-medium">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border border-line px-2 py-1">{children}</td>,
};

/** Renders the markdown body of a post with GFM support. */
export default function MarkdownBody({ body, className = "" }: MarkdownBodyProps) {
  return (
    <div className={`markdown break-words text-sm text-ink-2 ${className}`.trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
