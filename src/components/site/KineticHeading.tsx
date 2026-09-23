import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface KineticPart {
  text: string;
  /** Render this part as the italic serif accent. */
  accent?: boolean;
  /** Start a new line before this part. */
  breakBefore?: boolean;
}

interface KineticHeadingProps {
  parts: KineticPart[];
  as?: "h1" | "h2";
  className?: string;
  children?: ReactNode;
}

// Headline whose words slide up one by one out of a mask (CSS: .word-mask).
const KineticHeading = ({ parts, as: Tag = "h1", className }: KineticHeadingProps) => {
  let index = 0;
  return (
    <Tag className={className} aria-label={parts.map((p) => p.text).join(" ")}>
      {parts.map((part, p) => (
        <span key={p} aria-hidden>
          {part.breakBefore && <br />}
          {part.text.split(" ").map((word, w) => {
            const i = index++;
            return (
              <span key={`${p}-${w}`} className="word-mask">
                <span className={cn(part.accent && "accent")} style={{ ["--i" as string]: i }}>
                  {word}
                </span>
                {" "}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
};

export default KineticHeading;
