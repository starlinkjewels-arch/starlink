import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { toggleSaved, useWishlist } from "@/lib/wishlist";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
  productId: string;
  productName: string;
  /** "card": small round button over a product photo; "outline": matches the product page buttons. */
  variant?: "card" | "outline";
  className?: string;
}

const SaveButton = ({ productId, productName, variant = "card", className }: SaveButtonProps) => {
  const saved = useWishlist().includes(productId);
  const navigate = useNavigate();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleSaved(productId);
    if (nowSaved) {
      toast.success("Saved to your wishlist", { description: productName, action: { label: "View", onClick: () => navigate("/wishlist") } });
    } else {
      toast("Removed from your wishlist", { description: productName });
    }
  };

  const label = saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`;

  if (variant === "outline") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors hover:border-foreground",
          saved && "border-rose-200 bg-rose-50 text-rose-600 hover:border-rose-300 dark:bg-rose-950/30",
          className
        )}
      >
        <Heart className={cn("h-5 w-5 transition-transform", saved && "scale-110 fill-current")} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center glass press-glow rounded-full transition-all hover:scale-110 active:scale-[0.96]",
        saved ? "text-rose-600" : "text-foreground/70 hover:text-rose-600",
        className
      )}
    >
      <Heart className={cn("h-[18px] w-[18px]", saved && "fill-current animate-in zoom-in-50 duration-300")} />
    </button>
  );
};

export default SaveButton;
