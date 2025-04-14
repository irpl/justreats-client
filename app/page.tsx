"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Instagram,
  Mail,
  MinusCircle,
  PlusCircle,
  ShoppingBag,
  PhoneIcon as WhatsApp,
  Plus,
  X,
  Calendar,
  Filter,
  CalendarDays,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { EventBanner } from "@/components/event-banner"
import type { Product, CartItem, Banner, ContactInfo, AddOn, SelectedAddOn, Event } from "@/types/shop-types"

// Add imports for the useInfiniteScroll hook
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

// Add import for API utility
import { fetchApi, getApiUrl } from "@/utils/api"

// Default products if none exist in localStorage
const defaultProducts: Product[] = [
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
  // Event-only products
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

// Default add-ons
const defaultAddons: AddOn[] = [
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

// Default events
const defaultEvents: Event[] = [
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

// Default contact info
const defaultContactInfo: ContactInfo = {
  instagram: "sweetdelights",
  whatsapp: "+1234567890",
  email: "info@sweetdelights.com",
}

// Default banner
const defaultBanner: Banner = {
  enabled: true,
  imageUrl: "/placeholder.svg?height=400&width=1200",
  title: "Special Summer Collection",
  description: "Try our new seasonal fruit tarts and refreshing iced pastries!",
  linkToEventId: 1, // Link to the first event
}

// Function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function Home() {
  const router = useRouter()
  const [allAddons, setAllAddons] = useState<AddOn[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [banner, setBanner] = useState<Banner>(defaultBanner)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
  const [isLoading, setIsLoading] = useState(true)

  // Replace the products useState with the infinite scroll hook
  const {
    items: products,
    loading: loadingProducts,
    loaderRef: productsLoaderRef,
    hasMore: hasMoreProducts,
  } = useInfiniteScroll<Product>({
    pageSize: 6,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<Product[]>(`products?page=${page}&size=${size}`);
      } catch (error) {
        console.error("Error fetching products:", error)
        // Fallback to localStorage if API fails
        let storedProducts = JSON.parse(localStorage.getItem("pastryProducts") || "[]")

        // If no products in localStorage, use defaults and save them
        if (storedProducts.length === 0) {
          storedProducts = defaultProducts
          localStorage.setItem("pastryProducts", JSON.stringify(defaultProducts))
        }

        // Return a limited subset to simulate pagination
        const start = (page - 1) * size // Adjusted for 1-based pagination
        const end = start + size
        return storedProducts.slice(start, end)
      }
    },
    enabled: !isLoading,
  })

  // Replace the event fetching with infinite scroll
  const {
    items: events,
    loading: loadingEvents,
    loaderRef: eventsLoaderRef,
    hasMore: hasMoreEvents,
  } = useInfiniteScroll<Event>({
    pageSize: 3,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<Event[]>(`events?page=${page}&size=${size}`);
      } catch (error) {
        console.error("Error fetching events:", error)
        // Fallback to localStorage if API fails
        let storedEvents = JSON.parse(localStorage.getItem("pastryEvents") || "[]")

        if (storedEvents.length === 0) {
          storedEvents = defaultEvents
          localStorage.setItem("pastryEvents", JSON.stringify(defaultEvents))
        }

        // Return a limited subset to simulate pagination
        const start = (page - 1) * size // Adjusted for 1-based pagination
        const end = start + size
        return storedEvents.slice(start, end)
      }
    },
    enabled: !isLoading,
  })

  // Replace the add-ons fetching with infinite scroll
  const {
    items: addons,
    loading: loadingAddons,
    loaderRef: addonsLoaderRef,
    hasMore: hasMoreAddons,
  } = useInfiniteScroll<AddOn>({
    pageSize: 6,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<AddOn[]>(`addons?page=${page}&size=${size}`);
      } catch (error) {
        console.error("Error fetching add-ons:", error)
        // Fallback to localStorage if API fails
        let storedAddons = JSON.parse(localStorage.getItem("pastryAddons") || "[]")

        if (storedAddons.length === 0) {
          storedAddons = defaultAddons
          localStorage.setItem("pastryAddons", JSON.stringify(defaultAddons))
        }

        // Return a limited subset to simulate pagination
        const start = (page - 1) * size // Adjusted for 1-based pagination
        const end = start + size
        return storedAddons.slice(start, end)
      }
    },
    enabled: !isLoading,
  })

  // State for event filtering
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [showEventsSheet, setShowEventsSheet] = useState(false)

  // State for cart items
  const [cart, setCart] = useState<CartItem[]>([])

  // State for product quantities and notes
  const [quantities, setQuantities] = useState<Record<number, number>>({})
  const [notes, setNotes] = useState<Record<number, string>>({})

  // State for selected add-ons
  const [selectedAddons, setSelectedAddons] = useState<Record<number, SelectedAddOn[]>>({})

  // Load products and cart from localStorage on component mount
  // Update the useEffect to only handle cart, banner, and contact info
  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("pastryCart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    // Load banner settings from API
    const fetchBanner = async () => {
      try {
        const data = await fetchApi<Banner>("banner");
        setBanner(data);
      } catch (error) {
        console.error("Error fetching banner:", error)
        // Fallback to localStorage if API fails
        const savedBanner = localStorage.getItem("pastryBanner")
        if (savedBanner) {
          setBanner(JSON.parse(savedBanner))
        } else {
          localStorage.setItem("pastryBanner", JSON.stringify(defaultBanner))
        }
      }
    }

    // Load contact info from API
    const fetchContactInfo = async () => {
      try {
        const data = await fetchApi<ContactInfo>("contact");
        setContactInfo(data);
      } catch (error) {
        console.error("Error fetching contact info:", error)
        // Fallback to localStorage if API fails
        const savedContactInfo = localStorage.getItem("pastryContactInfo")
        if (savedContactInfo) {
          setContactInfo(JSON.parse(savedContactInfo))
        } else {
          localStorage.setItem("pastryContactInfo", JSON.stringify(defaultContactInfo))
        }
      }
    }

    fetchBanner()
    fetchContactInfo()

    setIsLoading(false)
  }, [])

  // Function to update quantity
  const updateQuantity = (productId: number, delta: number) => {
    setQuantities((prev) => {
      const newQuantity = Math.max(0, (prev[productId] || 0) + delta)
      return { ...prev, [productId]: newQuantity }
    })
  }

  // Function to update notes
  const updateNotes = (productId: number, text: string) => {
    setNotes((prev) => ({ ...prev, [productId]: text }))
  }

  // Function to add an add-on to a product
  const addAddon = (productId: number, addon: AddOn) => {
    setSelectedAddons((prev) => {
      const currentAddons = [...(prev[productId] || [])]
      // Check if this add-on is already selected
      const existingIndex = currentAddons.findIndex((item) => item.addon.id === addon.id)

      if (existingIndex >= 0) {
        // If already exists, don't add it again
        return prev
      }

      // Add new add-on with default quantity 1 and empty notes
      currentAddons.push({
        addon,
        quantity: 1,
        notes: "",
      })

      return { ...prev, [productId]: currentAddons }
    })
  }

  // Function to remove an add-on from a product
  const removeAddon = (productId: number, addonId: number) => {
    setSelectedAddons((prev) => {
      const currentAddons = [...(prev[productId] || [])]
      const updatedAddons = currentAddons.filter((item) => item.addon.id !== addonId)
      return { ...prev, [productId]: updatedAddons }
    })
  }

  // Function to update add-on quantity
  const updateAddonQuantity = (productId: number, addonId: number, delta: number) => {
    setSelectedAddons((prev) => {
      const currentAddons = [...(prev[productId] || [])]
      const addonIndex = currentAddons.findIndex((item) => item.addon.id === addonId)

      if (addonIndex >= 0) {
        const newQuantity = Math.max(1, currentAddons[addonIndex].quantity + delta)
        currentAddons[addonIndex] = {
          ...currentAddons[addonIndex],
          quantity: newQuantity,
        }
      }

      return { ...prev, [productId]: currentAddons }
    })
  }

  // Function to update add-on notes
  const updateAddonNotes = (productId: number, addonId: number, text: string) => {
    setSelectedAddons((prev) => {
      const currentAddons = [...(prev[productId] || [])]
      const addonIndex = currentAddons.findIndex((item) => item.addon.id === addonId)

      if (addonIndex >= 0) {
        currentAddons[addonIndex] = {
          ...currentAddons[addonIndex],
          notes: text,
        }
      }

      return { ...prev, [productId]: currentAddons }
    })
  }

  // Function to add item to cart
  const addToCart = (product: Product) => {
    const quantity = quantities[product.id]
    const note = notes[product.id]
    const productAddons = selectedAddons[product.id] || []

    if (quantity <= 0) return

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex((item) => item.product.id === product.id)

    let updatedCart
    if (existingItemIndex >= 0) {
      // Update existing item
      updatedCart = [...cart]
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity,
        notes: note,
        addons: productAddons,
      }
    } else {
      // Add new item
      updatedCart = [
        ...cart,
        {
          product,
          quantity,
          notes: note,
          addons: productAddons,
        },
      ]
    }

    setCart(updatedCart)
    // Save to localStorage
    localStorage.setItem("pastryCart", JSON.stringify(updatedCart))

    // Reset quantity, notes, and selected add-ons for this product
    setQuantities((prev) => ({ ...prev, [product.id]: 0 }))
    setNotes((prev) => ({ ...prev, [product.id]: "" }))
    setSelectedAddons((prev) => ({ ...prev, [product.id]: [] }))
  }

  // Calculate item price including add-ons
  const calculateItemPrice = (product: Product, productAddons: SelectedAddOn[]) => {
    const basePrice = product.price
    const addonsPrice = productAddons.reduce((sum, addon) => {
      return sum + addon.addon.price * addon.quantity
    }, 0)

    return basePrice + addonsPrice
  }

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => {
    const itemPrice = calculateItemPrice(item.product, item.addons)
    return sum + itemPrice * item.quantity
  }, 0)

  // Function to remove item from cart
  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
    localStorage.setItem("pastryCart", JSON.stringify(updatedCart))
  }

  // Format WhatsApp number for link
  const formatWhatsAppLink = (number: string) => {
    // Remove any non-digit characters
    const digits = number.replace(/\D/g, "")
    return `https://wa.me/${digits}`
  }

  // Get applicable add-ons for a product
  const getApplicableAddons = (product: Product) => {
    if (!product.applicableAddons) return []

    return addons.filter((addon) => product.applicableAddons?.includes(addon.id) && addon.available !== false)
  }

  // Handle event selection
  const handleSelectEvent = (eventId: number) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId)
    setShowEventsSheet(false)
  }

  // Get filtered products based on event selection
  const getFilteredProducts = () => {
    if (!selectedEventId) {
      // If no event is selected, show only non-event products
      return products.filter((product) => !product.eventOnly)
    } else {
      // If an event is selected, show ONLY products for that event
      return products.filter((product) => product.eventOnly && product.eventId === selectedEventId)
    }
  }

  // Get the selected event
  const selectedEvent = selectedEventId ? events.find((event) => event.id === selectedEventId) : null

  // Get featured events
  const featuredEvents = events.filter((event) => event.featured)

  // Handle banner event link
  const handleBannerEventLink = () => {
    if (banner.linkToEventId) {
      setSelectedEventId(banner.linkToEventId)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-primary">Sweet Delights Bakery</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEventsSheet(true)} className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Events</span>
            {selectedEventId && (
              <Badge className="ml-2" variant="secondary">
                1
              </Badge>
            )}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative">
                <ShoppingBag className="h-5 w-5 mr-2" />
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Your Order</SheetTitle>
                <SheetDescription>Review your items before checkout</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">Your cart is empty</p>
                ) : (
                  <>
                    {cart.map((item, index) => (
                      <div key={index} className="flex flex-col border-b pb-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            {item.notes && <p className="text-sm italic mt-1">Note: {item.notes}</p>}
                            {item.product.eventOnly && (
                              <Badge variant="outline" className="mt-1">
                                Event Pickup Only
                              </Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <p>${(calculateItemPrice(item.product, item.addons) * item.quantity).toFixed(2)}</p>
                            <button onClick={() => removeFromCart(index)} className="text-sm text-red-500 mt-1">
                              Remove
                            </button>
                          </div>
                        </div>

                        {item.addons.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-muted">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Add-ons:</p>
                            {item.addons.map((addon, addonIndex) => (
                              <div key={addonIndex} className="flex justify-between text-sm">
                                <div>
                                  <p className="text-sm">
                                    {addon.addon.name} (x{addon.quantity})
                                  </p>
                                  {addon.notes && <p className="text-xs italic">Note: {addon.notes}</p>}
                                </div>
                                <p>${(addon.addon.price * addon.quantity).toFixed(2)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2">
                      <span>Total:</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button
                      className="w-full mt-6"
                      onClick={() => router.push("/checkout")}
                      disabled={cart.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-8 px-2 text-center">
        <a
          href={`https://instagram.com/${contactInfo.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Instagram className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">@{contactInfo.instagram}</span>
        </a>
        <span className="hidden sm:inline text-muted-foreground">•</span>
        <a
          href={formatWhatsAppLink(contactInfo.whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <WhatsApp className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{contactInfo.whatsapp}</span>
        </a>
        <span className="hidden sm:inline text-muted-foreground">•</span>
        <a
          href={`mailto:${contactInfo.email}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{contactInfo.email}</span>
        </a>
      </div>

      {/* Banner Section */}
      {banner.enabled && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-md">
          <div className="relative">
            <img
              src={banner.imageUrl || "/placeholder.svg"}
              alt={banner.title}
              className="w-full h-48 md:h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-6">
              <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">{banner.title}</h2>
              <p className="text-white/90 max-w-md">{banner.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Event Banner */}
      {selectedEvent && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{selectedEvent.name}</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEventId(null)}>
              <X className="h-4 w-4 mr-2" />
              Show Regular Products
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={selectedEvent.image || "/placeholder.svg"}
                  alt={selectedEvent.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white">
                    <div className="mb-2 md:mb-0">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2" />
                        <span>
                          {selectedEvent.endDate
                            ? `${formatDate(selectedEvent.date)} - ${formatDate(selectedEvent.endDate)}`
                            : formatDate(selectedEvent.date)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <MapPin className="h-4  w-4 mr-2" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-muted-foreground">{selectedEvent.description}</p>
                <div className="mt-4 bg-muted/30 p-3 rounded-md">
                  <p className="text-sm font-medium">
                    Event-only items are available for pickup at this event location only.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Events Sheet */}
      <Sheet open={showEventsSheet} onOpenChange={setShowEventsSheet}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Upcoming Events</SheetTitle>
            <SheetDescription>Browse our events and special offerings</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            {events.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">No upcoming events</p>
            ) : (
              <>
                {selectedEventId && (
                  <Button variant="outline" className="w-full" onClick={() => setSelectedEventId(null)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Show Regular Products
                  </Button>
                )}
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventBanner
                      key={event.id}
                      event={event}
                      onSelectEvent={handleSelectEvent}
                      isSelected={selectedEventId === event.id}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Featured Events (if no event is selected) */}
      {!selectedEventId && featuredEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredEvents.map((event) => (
              <EventBanner key={event.id} event={event} onSelectEvent={handleSelectEvent} isSelected={false} />
            ))}

            {/* Loader for infinite scrolling */}
            {hasMoreEvents && (
              <div ref={eventsLoaderRef} className="col-span-full py-4 flex justify-center">
                {loadingEvents && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-4">{selectedEventId ? "Event-Only Products" : "Our Products"}</h2>

        {getFilteredProducts().length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">No Products Available</h2>
            <p className="text-muted-foreground">
              {selectedEventId
                ? "There are currently no products available for this event."
                : "There are currently no products available for order."}
            </p>
            {selectedEventId && (
              <Button variant="outline" className="mt-4" onClick={() => setSelectedEventId(null)}>
                Show Regular Products
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredProducts().map((product) => {
              const applicableAddons = getApplicableAddons(product)
              const productAddons = selectedAddons[product.id] || []
              const itemPrice = calculateItemPrice(product, productAddons)

              return (
                <Card key={product.id} className={`overflow-hidden ${product.eventOnly ? "border-primary/30" : ""}`}>
                  <div className="aspect-video w-full overflow-hidden relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    {product.eventOnly && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-primary">Event Only</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-semibold">{product.name}</h2>
                      <div className="text-right">
                        <p className="font-medium">${product.price.toFixed(2)}</p>
                        {productAddons.length > 0 && (
                          <p className="text-xs text-muted-foreground">With add-ons: ${itemPrice.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{product.description}</p>

                    {product.eventOnly && (
                      <div className="mb-4 bg-muted/30 p-2 rounded-md">
                        <p className="text-xs text-muted-foreground">
                          This item is available for pickup at the event location only.
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`quantity-${product.id}`}>Quantity</Label>
                        <div className="flex items-center mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(product.id, -1)}
                            disabled={quantities[product.id] <= 0}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                          <Input
                            id={`quantity-${product.id}`}
                            type="number"
                            min="0"
                            className="w-16 mx-2 text-center"
                            value={quantities[product.id] || 0}
                            onChange={(e) => {
                              const val = Number.parseInt(e.target.value) || 0
                              setQuantities({ ...quantities, [product.id]: Math.max(0, val) })
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(product.id, 1)}
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`notes-${product.id}`}>Special Instructions</Label>
                        <Textarea
                          id={`notes-${product.id}`}
                          placeholder="Any special requests?"
                          className="mt-1 resize-none"
                          value={notes[product.id] || ""}
                          onChange={(e) => updateNotes(product.id, e.target.value)}
                        />
                      </div>

                      {/* Add-ons Section */}
                      {applicableAddons.length > 0 && (
                        <div className="mt-4">
                          <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="add-ons">
                              <AccordionTrigger className="text-sm font-medium">
                                Customize with Add-ons
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2">
                                  {/* Selected Add-ons */}
                                  {productAddons.length > 0 && (
                                    <div className="space-y-3">
                                      <h4 className="text-sm font-medium">Selected Add-ons:</h4>
                                      {productAddons.map((selectedAddon) => (
                                        <div
                                          key={selectedAddon.addon.id}
                                          className="bg-muted/50 rounded-md p-3 relative"
                                        >
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1 h-6 w-6"
                                            onClick={() => removeAddon(product.id, selectedAddon.addon.id)}
                                          >
                                            <X className="h-4 w-4" />
                                          </Button>

                                          <div className="flex justify-between items-start mb-2 pr-6">
                                            <div>
                                              <p className="font-medium">{selectedAddon.addon.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                ${selectedAddon.addon.price.toFixed(2)} each
                                              </p>
                                            </div>
                                            <Badge variant="outline">
                                              ${(selectedAddon.addon.price * selectedAddon.quantity).toFixed(2)}
                                            </Badge>
                                          </div>

                                          <div className="flex items-center mt-2">
                                            <Label className="text-xs mr-2">Quantity:</Label>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() =>
                                                updateAddonQuantity(product.id, selectedAddon.addon.id, -1)
                                              }
                                              disabled={selectedAddon.quantity <= 1}
                                            >
                                              <MinusCircle className="h-3 w-3" />
                                            </Button>
                                            <span className="mx-2 text-sm">{selectedAddon.quantity}</span>
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() => updateAddonQuantity(product.id, selectedAddon.addon.id, 1)}
                                            >
                                              <PlusCircle className="h-3 w-3" />
                                            </Button>
                                          </div>

                                          <div className="mt-2">
                                            <Label className="text-xs">Instructions:</Label>
                                            <Textarea
                                              placeholder={`Instructions for ${selectedAddon.addon.name}`}
                                              className="mt-1 resize-none text-sm min-h-[60px]"
                                              value={selectedAddon.notes}
                                              onChange={(e) =>
                                                updateAddonNotes(product.id, selectedAddon.addon.id, e.target.value)
                                              }
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Available Add-ons */}
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Available Add-ons:</h4>
                                    <div className="space-y-2">
                                      {applicableAddons
                                        .filter((addon) => !productAddons.some((pa) => pa.addon.id === addon.id))
                                        .map((addon) => (
                                          <div
                                            key={addon.id}
                                            className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50"
                                          >
                                            <div>
                                              <p className="font-medium text-sm">{addon.name}</p>
                                              <p className="text-xs text-muted-foreground">{addon.description}</p>
                                            </div>
                                            <div className="flex items-center">
                                              <span className="text-sm font-medium mr-2">
                                                ${addon.price.toFixed(2)}
                                              </span>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => addAddon(product.id, addon)}
                                              >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Add
                                              </Button>
                                            </div>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => addToCart(product)}
                      disabled={!quantities[product.id] || quantities[product.id] <= 0}
                    >
                      Add to Order
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}

            {/* Loader for infinite scrolling */}
            {!selectedEventId && hasMoreProducts && (
              <div ref={productsLoaderRef} className="col-span-full py-4 flex justify-center">
                {loadingProducts && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
