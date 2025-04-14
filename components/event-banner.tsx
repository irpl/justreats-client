"use client"

import { useState, useEffect } from "react"
import { CalendarDays, MapPin, ArrowRight } from "lucide-react"
import type { Event } from "@/types/shop-types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface EventBannerProps {
  event: Event
  onSelectEvent: (eventId: number) => void
  isSelected: boolean
}

export function EventBanner({ event, onSelectEvent, isSelected }: EventBannerProps) {
  // Format the event date for display
  const displayDate = event.endDate
    ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
    : formatDate(event.date)

  // Calculate if the event is upcoming, current, or past
  const [eventStatus, setEventStatus] = useState<"upcoming" | "current" | "past">("upcoming")

  useEffect(() => {
    const now = new Date()
    const eventDate = new Date(event.date)
    const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.date)

    // Add a day to end date to include the full day
    eventEndDate.setDate(eventEndDate.getDate() + 1)

    if (now < eventDate) {
      setEventStatus("upcoming")
    } else if (now > eventEndDate) {
      setEventStatus("past")
    } else {
      setEventStatus("current")
    }
  }, [event])

  return (
    <div
      className={`relative rounded-lg overflow-hidden shadow-md border ${isSelected ? "border-primary" : "border-muted"}`}
    >
      <div className="relative">
        <img
          src={event.image || "/placeholder.svg?height=300&width=600"}
          alt={event.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white text-xl font-bold">{event.name}</h3>

          {/* Event status badge */}
          <div className="absolute top-2 right-2">
            {eventStatus === "current" && <Badge className="bg-green-500">Happening Now</Badge>}
            {eventStatus === "upcoming" && (
              <Badge variant="outline" className="bg-black/50 text-white border-white">
                Upcoming
              </Badge>
            )}
            {eventStatus === "past" && (
              <Badge variant="outline" className="bg-black/50 text-white border-white">
                Past Event
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 bg-white">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <CalendarDays className="h-4 w-4 mr-1" />
          <span>{displayDate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{event.location}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
        <Button
          onClick={() => onSelectEvent(event.id)}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          disabled={eventStatus === "past"}
        >
          {isSelected ? "Currently Viewing" : eventStatus === "past" ? "Event Ended" : "View Event-Only Items"}
          {!isSelected && eventStatus !== "past" && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
