import PostCard from "./PostCard";
import type { ThreadNode } from "@/lib/api/types";

export interface ThreadTreeProps {
  /** Root node returned by GET /threads/{postID}. */
  root: ThreadNode;
}

function ThreadBranch({ node, nested }: { node: ThreadNode; nested: boolean }) {
  return (
    <div
      className={
        nested
          ? "relative mt-3 pl-4 before:absolute before:top-0 before:left-0 before:h-full before:w-px before:bg-line sm:pl-6"
          : ""
      }
    >
      <PostCard post={node.post} showThreadLink={false} />
      {node.children.map((child) => (
        <ThreadBranch key={child.post.id} node={child} nested />
      ))}
    </div>
  );
}

/** Renders a discussion tree, indenting each level of replies. */
export default function ThreadTree({ root }: ThreadTreeProps) {
  return <ThreadBranch node={root} nested={false} />;
}
