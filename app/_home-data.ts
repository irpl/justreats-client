import type { AddOn, Banner, ContactInfo, Event, Product } from "@/types/shop-types"

// Default products if none exist in localStorage
export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Chocolate Croissant",
    description: "Buttery, flaky pastry filled with rich chocolate",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [1, 3],
  },
  {
    id: 2,
    name: "Strawberry Tart",
    description: "Sweet pastry crust filled with custard and topped with fresh strawberries",
    price: 4.99,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [1, 2],
  },
  {
    id: 3,
    name: "Vanilla Macaron",
    description: "Light and airy almond meringue cookies with vanilla buttercream filling",
    price: 2.49,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [3],
  },
  {
    id: 4,
    name: "Cinnamon Roll",
    description: "Soft, sweet roll with cinnamon-sugar filling and cream cheese frosting",
    price: 3.49,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [1],
  },
  {
    id: 5,
    name: "Lemon Cake",
    description: "Moist cake with zesty lemon flavor and sweet glaze",
    price: 4.49,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [1, 2, 3],
  },
  {
    id: 6,
    name: "Chocolate Truffle",
    description: "Rich, creamy chocolate ganache rolled in cocoa powder",
    price: 1.99,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [3],
  },
  {
    id: 7,
    name: "Festival Special Cupcake",
    description: "Limited edition cupcake with seasonal decorations",
    price: 3.99,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [1, 2],
    eventOnly: true,
    eventId: 1,
  },
  {
    id: 8,
    name: "Market Day Cookies",
    description: "Freshly baked cookies only available at our market events",
    price: 2.49,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [3],
    eventOnly: true,
    eventId: 1,
  },
  {
    id: 9,
    name: "Holiday Gingerbread House",
    description: "Festive gingerbread house kit, perfect for the holiday season",
    price: 12.99,
    image: "/placeholder.svg?height=200&width=200",
    available: true,
    applicableAddons: [2],
    eventOnly: true,
    eventId: 2,
  },
]

export const defaultAddons: AddOn[] = [
  {
    id: 1,
    name: "Custom Message Plaque",
    description: "Add a personalized message on a chocolate plaque",
    price: 2.99,
    applicableProducts: [1, 2, 4, 5, 7],
    available: true,
  },
  {
    id: 2,
    name: "Special Decoration",
    description: "Add special decorative elements like flowers, figures, etc.",
    price: 3.99,
    applicableProducts: [2, 5, 7, 9],
    available: true,
  },
  {
    id: 3,
    name: "Gift Packaging",
    description: "Special gift box with ribbon and card",
    price: 1.99,
    applicableProducts: [1, 3, 5, 6, 8],
    available: true,
  },
]

export const defaultEvents: Event[] = [
  {
    id: 1,
    name: "Downtown Farmers Market",
    description: "Join us at the weekly farmers market where we'll have special treats and seasonal favorites!",
    date: "2025-04-10T09:00:00",
    endDate: "2025-04-10T14:00:00",
    location: "Central Plaza, Downtown",
    image: "/placeholder.svg?height=300&width=600",
    active: true,
    featured: true,
  },
  {
    id: 2,
    name: "Holiday Bake Sale",
    description: "Our annual holiday bake sale with festive treats and gift ideas for the season.",
    date: "2025-12-15T10:00:00",
    endDate: "2025-12-16T18:00:00",
    location: "Community Center, 123 Main St",
    image: "/placeholder.svg?height=300&width=600",
    active: true,
  },
  {
    id: 3,
    name: "Spring Food Festival",
    description: "A celebration of spring flavors featuring our seasonal specialties.",
    date: "2025-05-20T11:00:00",
    endDate: "2025-05-22T20:00:00",
    location: "City Park Pavilion",
    image: "/placeholder.svg?height=300&width=600",
    active: true,
  },
]

export const defaultContactInfo: ContactInfo = {
  instagram: "sweetdelights",
  whatsapp: "+1234567890",
  email: "info@sweetdelights.com",
}

export const defaultBanner: Banner = {
  enabled: true,
  imageUrl: "/placeholder.svg?height=400&width=1200",
  title: "Special Summer Collection",
  description: "Try our new seasonal fruit tarts and refreshing iced pastries!",
  linkToEventId: 1,
}

export function formatLongDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
