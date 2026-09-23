import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: { label: string; to: string };
  className?: string;
  as?: "h1" | "h2";
}

const SectionHeading = ({ eyebrow, title, description, align = "left", action, className, as: Heading = "h2" }: SectionHeadingProps) => {
  const centered = align === "center";
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-col gap-5 md:mb-14",
        centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", centered && "mx-auto")}>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <Heading className="heading-lg text-balance">{title}</Heading>
        {description && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Link to={action.to} className="link-underline shrink-0 text-foreground">
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </Reveal>
  );
};

export default SectionHeading;
