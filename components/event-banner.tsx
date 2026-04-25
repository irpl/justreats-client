"use client"

import { useState, useEffect } from "react"
import { CalendarDays, MapPin, ArrowRight } from "lucide-react"
import type { Event } from "@/types/shop-types"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface EventBannerProps {
  event: Event
  onSelectEvent: (eventId: number) => void
  isSelected: boolean
}

export function EventBanner({ event, onSelectEvent, isSelected }: EventBannerProps) {
  const displayDate = event.endDate
    ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
    : formatDate(event.date)

  const [eventStatus, setEventStatus] = useState<"upcoming" | "current" | "past">("upcoming")

  useEffect(() => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.date)
    eventEndDate.setDate(eventEndDate.getDate() + 1)

    if (now < eventDate) setEventStatus("upcoming")
    else if (now > eventEndDate) setEventStatus("past")
    else setEventStatus("current")
  }, [event])

  const isPast = eventStatus === "past"
  const accent = isSelected ? "bg-brand-purple" : "bg-brand-pink"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] border-[3px] border-dashed bg-white",
        isSelected ? "border-brand-purple" : "border-brand-pink/60",
        "transition-transform duration-200 hover:-translate-y-0.5",
      )}
    >
      {/* Image with status pill */}
      <div className="relative">
        <img
          src={event.image || "/placeholder.svg?height=300&width=600"}
          alt={event.name}
          className="h-40 w-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {eventStatus === "current" && (
            <span className="inline-flex rounded-full bg-brand-mint px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-white shadow">
              Happening Now
            </span>
          )}
          {eventStatus === "upcoming" && (
            <span className="inline-flex rounded-full bg-brand-pink px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-white shadow">
              Upcoming
            </span>
          )}
          {eventStatus === "past" && (
            <span className="inline-flex rounded-full bg-brand-ink/70 px-3 py-1 text-[10px] font-display font-bold uppercase tracking-wider text-white shadow">
              Past
            </span>
          )}
        </div>
      </div>

      <div className="p-4 text-center">
        <h3 className="font-display font-extrabold uppercase tracking-wide text-lg text-brand-ink leading-tight">
          {event.name}
        </h3>

        <div className="mt-2 space-y-1">
          <p className="font-script text-lg text-brand-purple">{displayDate}</p>
          <div className="flex items-center justify-center gap-1 text-xs uppercase tracking-wider text-brand-ink/70">
            <MapPin className="h-3 w-3" />
            <span>{event.location}</span>
          </div>
        </div>

        {event.description && (
          <p className="mt-2 line-clamp-2 text-xs text-brand-ink/60">{event.description}</p>
        )}

        <Button
          onClick={() => onSelectEvent(event.id)}
          disabled={isPast}
          className={cn(
            "mt-4 w-full rounded-full font-display font-bold uppercase tracking-wider text-white",
            "shadow-md hover:opacity-95",
            isSelected ? "bg-brand-purple hover:bg-brand-purple" : "bg-brand-pink hover:bg-brand-pink",
            isPast && "bg-brand-ink/40 hover:bg-brand-ink/40",
          )}
        >
          {isSelected ? "Currently Viewing" : isPast ? "Event Ended" : "View Items"}
          {!isSelected && !isPast && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
