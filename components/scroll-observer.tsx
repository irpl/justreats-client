import { forwardRef } from "react"
import { LoadingSpinner } from "./loading-spinner"

interface ScrollObserverProps {
  loading: boolean
  hasMore: boolean
  className?: string
}

export const ScrollObserver = forwardRef<HTMLDivElement, ScrollObserverProps>(
  ({ loading, hasMore, className = "" }, ref) => {
    if (!hasMore) return null

    return (
      <div ref={ref} className={`py-6 flex justify-center items-center ${className}`}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="h-6 w-6 opacity-0">‎</div> // Invisible placeholder to maintain height
        )}
      </div>
    )
  },
)

ScrollObserver.displayName = "ScrollObserver"
