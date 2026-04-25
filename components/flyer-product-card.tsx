import type { Product } from "@/types/shop-types"
import { cn } from "@/lib/utils"

interface FlyerProductCardProps {
  product: Product
  index: number
  cartQuantity?: number
  onSelect: (product: Product) => void
}

export function FlyerProductCard({ product, index, cartQuantity = 0, onSelect }: FlyerProductCardProps) {
  const isPurple = index % 2 === 1
  const accentBg = isPurple ? "bg-brand-purple" : "bg-brand-pink"
  const borderColor = isPurple ? "border-brand-purple/60" : "border-brand-pink/60"
  const ringHover = isPurple ? "hover:ring-brand-purple/40" : "hover:ring-brand-pink/40"

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={cn(
        "group relative flex flex-col rounded-3xl border-[3px] border-dashed bg-white p-3 pb-6 text-left",
        "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        "ring-0 ring-offset-2 ring-offset-brand-blush hover:ring-2",
        borderColor,
        ringHover,
      )}
    >
      {/* Cart-quantity indicator */}
      {cartQuantity > 0 && (
        <span
          className={cn(
            "absolute -top-2 -right-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full px-2",
            "border-2 border-white text-xs font-display font-bold text-white shadow-md",
            accentBg,
          )}
          aria-label={`${cartQuantity} in cart`}
        >
          {cartQuantity}
        </span>
      )}

      {/* Product image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-blush">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {product.eventOnly && (
          <span className="absolute top-2 right-2 rounded-full bg-brand-purple px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider text-white shadow">
            Event
          </span>
        )}
      </div>

      {/* Numbered badge (overlaps image bottom) */}
      <div
        className={cn(
          "relative -mt-5 mx-auto flex h-10 w-10 items-center justify-center rounded-full",
          "border-[3px] border-white text-white font-display font-extrabold shadow-md",
          accentBg,
        )}
      >
        {index + 1}
      </div>

      {/* Product name + description */}
      <div className="mt-3 flex-1 px-1 text-center">
        <h3 className="font-display font-extrabold uppercase tracking-wide text-base sm:text-lg leading-tight text-brand-ink">
          {product.name}
        </h3>
        {product.description && (
          <p className="mt-1 text-[11px] sm:text-xs uppercase tracking-wider text-brand-ink/70 leading-snug line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      {/* Price pill */}
      <div className="mt-4 flex justify-center">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-6 py-2 font-display font-extrabold text-white shadow-md",
            "tracking-wide text-base",
            accentBg,
          )}
        >
          ${product.price.toFixed(2)}
        </span>
      </div>
    </button>
  )
}
