import { cn } from "@/lib/utils"

type Variant = "pink" | "mint" | "purple"

const heartSrc: Record<Variant, string> = {
  pink: "/heart-pink.svg",
  mint: "/heart-mint.svg",
  purple: "/heart-purple.svg",
}

interface HeartDecorProps {
  variant?: Variant
  className?: string
  rotate?: number
}

export function HeartDecor({ variant = "pink", className, rotate = 0 }: HeartDecorProps) {
  return (
    <img
      src={heartSrc[variant]}
      alt=""
      aria-hidden
      className={cn("pointer-events-none select-none drop-shadow-sm", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  )
}

interface SparkleDecorProps {
  className?: string
  rotate?: number
}

export function SparkleDecor({ className, rotate = 0 }: SparkleDecorProps) {
  return (
    <img
      src="/sparkle.svg"
      alt=""
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    />
  )
}

interface DashedFrameProps {
  children: React.ReactNode
  className?: string
  variant?: "pink" | "purple"
}

export function DashedFrame({ children, className, variant = "pink" }: DashedFrameProps) {
  const borderColor = variant === "pink" ? "border-brand-pink/60" : "border-brand-purple/60"
  return (
    <div
      className={cn(
        "relative rounded-[28px] border-[3px] border-dashed bg-white/70 backdrop-blur-sm",
        borderColor,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Ribbon({
  children,
  variant = "pink",
  className,
}: {
  children: React.ReactNode
  variant?: "pink" | "purple"
  className?: string
}) {
  const bg = variant === "pink" ? "bg-brand-pink-soft text-brand-pink" : "bg-brand-purple-soft text-brand-purple"
  return (
    <div
      className={cn(
        "brand-ribbon font-display font-extrabold uppercase tracking-[0.18em] text-center px-12 py-3 shadow-sm",
        bg,
        className,
      )}
    >
      {children}
    </div>
  )
}
