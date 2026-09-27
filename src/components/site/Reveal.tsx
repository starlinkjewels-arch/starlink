import type { ElementType, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Kept for call-site compatibility; there is no scroll animation any more. */
  delay?: number;
  as?: ElementType;
}

// Section/list wrapper. It used to fade content up on scroll; that was removed at the client's
// request, so it now renders its children as-is.
const Reveal = ({ children, className, as: Tag = "div" }: RevealProps) => <Tag className={className}>{children}</Tag>;

export default Reveal;
