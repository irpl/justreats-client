import { MapPin } from "lucide-react"
import { DashedFrame, HeartDecor, Ribbon } from "@/components/flyer-decor"
import { cn } from "@/lib/utils"

interface FlyerPickupCardProps {
  heading?: string
  location: string
  date?: string
  timeRange?: string
  onClick?: () => void
  className?: string
}

export function FlyerPickupCard({
  heading = "Pickup is from",
  location,
  date,
  timeRange,
  onClick,
  className,
}: FlyerPickupCardProps) {
  const interactive = Boolean(onClick)

  return (
    <DashedFrame variant="pink" className={cn("p-5 sm:p-6", className)}>
      <div
        className={cn(
          "flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 text-center sm:text-left",
          interactive && "cursor-pointer transition-transform hover:-translate-y-0.5",
        )}
        onClick={onClick}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={(e) => {
          if (interactive && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onClick?.()
          }
        }}
      >
        {/* Map pin in heart frame */}
        <div className="relative shrink-0">
          <HeartDecor variant="pink" className="h-20 w-20" />
          <MapPin
            className="absolute inset-0 m-auto h-8 w-8 text-white"
            fill="white"
            strokeWidth={2.5}
          />
        </div>

        <div className="flex-1 space-y-2">
          <p className="font-display font-bold uppercase tracking-[0.18em] text-xs text-brand-pink">
            {heading}
          </p>
          <h3 className="font-display font-extrabold uppercase tracking-wide text-2xl sm:text-3xl text-brand-pink leading-tight">
            {location}
          </h3>
          {date && (
            <p className="font-script text-2xl text-brand-purple">
              {date}
            </p>
          )}
          {timeRange && (
            <div className="mt-3 flex justify-center sm:justify-start">
              <Ribbon variant="pink" className="text-xs px-10 py-2">
                {timeRange}
              </Ribbon>
            </div>
          )}
        </div>
      </div>
    </DashedFrame>
  )
}
