"use client"

import { Checkbox } from "@/components/ui/checkbox"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  BarChart3,
  ClipboardList,
  Edit,
  ImageIcon,
  Instagram,
  LogOut,
  Mail,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Trash,
  Users,
  PhoneIcon as WhatsApp,
  PlusCircle,
  Calendar,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { Product, Order, Banner, ContactInfo, AddOn, SelectedAddOn, Event } from "@/types/shop-types"

// Add imports for the useInfiniteScroll hook
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"

// Add import for API utility
import { fetchApi, getApiUrl } from "@/utils/api"

// Helper function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Product form type
type ProductFormData = {
  id: number
  name: string
  description: string
  price: string
  image: string
  available: boolean
  applicableAddons?: number[]
  eventOnly: boolean
  eventId?: number
}

// Add-on form type
type AddonFormData = {
  id: number
  name: string
  description: string
  price: string
  available: boolean
  applicableProducts?: number[]
}

// Default banner
const defaultBanner: Banner = {
  enabled: true,
  imageUrl: "/placeholder.svg?height=400&width=1200",
  title: "Special Summer Collection",
  description: "Try our new seasonal fruit tarts and refreshing iced pastries!",
}

// Default contact info
const defaultContactInfo: ContactInfo = {
  instagram: "sweetdelights",
  whatsapp: "+1234567890",
  email: "info@sweetdelights.com",
}

// Default add-ons
const defaultAddons: AddOn[] = [
  {
    id: 1,
    name: "Custom Message Plaque",
    description: "Add a personalized message on a chocolate plaque",
    price: 2.99,
    applicableProducts: [1, 2, 4, 5],
    available: true,
  },
  {
    id: 2,
    name: "Special Decoration",
    description: "Add special decorative elements like flowers, figures, etc.",
    price: 3.99,
    applicableProducts: [2, 5],
    available: true,
  },
  {
    id: 3,
    name: "Gift Packaging",
    description: "Special gift box with ribbon and card",
    price: 1.99,
    applicableProducts: [1, 3, 5, 6],
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

export default function AdminDashboard() {
  // Replace the products, addons, and events state with the one managed by our infinite scroll hook
  // (This comes right after the existing useState declarations)
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [banner, setBanner] = useState<Banner>(defaultBanner)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
  const [isLoading, setIsLoading] = useState(true)

  // Replace the products useState with the infinite scroll hook
  const {
    items: products,
    loading: loadingProducts,
    loaderRef: productsLoaderRef,
    hasMore: hasMoreProducts,
    resetItems: resetProducts,
  } = useInfiniteScroll<Product>({
    pageSize: 9,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<Product[]>(`products?page=${page}&size=${size}`);
      } catch (error) {
        console.error("Error fetching products:", error)
        // Fallback to localStorage if API fails
        const savedProducts = JSON.parse(localStorage.getItem("pastryProducts") || "[]")
        // Return a limited subset to simulate pagination
        const start = (page - 1) * size // Adjusted for 1-based pagination
        const end = start + size
        return savedProducts.slice(start, end)
      }
    },
    enabled: !isLoading,
  })

  // Replace the add-ons state with infinite scroll hook
  const {
    items: addons,
    loading: loadingAddons,
    loaderRef: addonsLoaderRef,
    hasMore: hasMoreAddons,
    resetItems: resetAddons,
  } = useInfiniteScroll<AddOn>({
    pageSize: 9,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<AddOn[]>(`addons?page=${page}&size=${size}`);
      } catch (error) {
        console.error("Error fetching add-ons:", error)
        // Fallback to localStorage
        let storedAddons = JSON.parse(localStorage.getItem("pastryAddons") || "[]")
        if (storedAddons.length === 0) {
          storedAddons = defaultAddons
          localStorage.setItem("pastryAddons", JSON.stringify(defaultAddons))
        }
        // Return a limited subset
        const start = (page - 1) * size // Adjusted for 1-based pagination
        const end = start + size
        return storedAddons.slice(start, end)
      }
    },
    enabled: !isLoading,
  })

  // Replace the events state with infinite scroll hook
  const {
    items: events,
    loading: loadingEvents,
    loaderRef: eventsLoaderRef,
    hasMore: hasMoreEvents,
    resetItems: resetEvents,
  } = useInfiniteScroll<Event>({
    pageSize: 6,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<Event[]>(`events?page=${page}&size=${size}`);
      } catch (error) {
        console.error("Error fetching events:", error)
        // Fallback to localStorage
        let storedEvents = JSON.parse(localStorage.getItem("pastryEvents") || "[]")
        if (storedEvents.length === 0) {
          storedEvents = defaultEvents
          localStorage.setItem("pastryEvents", JSON.stringify(defaultEvents))
        }
        // Return a limited subset
        const start = (page - 1) * size // Adjusted for 1-based pagination
        const end = start + size
        return storedEvents.slice(start, end)
      }
    },
    enabled: !isLoading,
  })

  // Add event management state variables after the existing state declarations (around line 100)
  const [isEditEventDialogOpen, setIsEditEventDialogOpen] = useState(false)
  const [isAddEventDialogOpen, setIsAddEventDialogOpen] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<Event>({
    id: 0,
    name: "",
    description: "",
    date: new Date().toISOString(),
    endDate: "",
    location: "",
    image: "/placeholder.svg?height=300&width=600",
    active: true,
    featured: false,
  })
  const [eventFormErrors, setEventFormErrors] = useState({
    name: false,
    description: false,
    date: false,
    location: false,
    image: false,
  })

  // Product form state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  // Add event-related fields to the product form state (around line 110)
  // Update the currentProduct state to include event-related fields
  const [currentProduct, setCurrentProduct] = useState<ProductFormData>({
    id: 0,
    name: "",
    description: "",
    price: "",
    image: "",
    available: true,
    applicableAddons: [],
    eventOnly: false,
    eventId: undefined,
  })
  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    price: false,
    image: false,
  })

  // Add-on form state
  const [isEditAddonDialogOpen, setIsEditAddonDialogOpen] = useState(false)
  const [isAddAddonDialogOpen, setIsAddAddonDialogOpen] = useState(false)
  const [currentAddon, setCurrentAddon] = useState<AddonFormData>({
    id: 0,
    name: "",
    description: "",
    price: "",
    available: true,
    applicableProducts: [],
  })
  const [addonFormErrors, setAddonFormErrors] = useState({
    name: false,
    description: false,
    price: false,
  })

  // Update the useEffect to load banner and contact info from API
  useEffect(() => {
    // Check authentication
    const auth = JSON.parse(localStorage.getItem("adminAuth") || "{}")
    if (!auth.isAuthenticated) {
      router.push("/admin/login")
      return
    }

    // Load orders
    const savedOrders = JSON.parse(localStorage.getItem("pastryOrders") || "[]")
    setOrders(savedOrders)

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

    // Calculate product summary
    const summary: Record<string, number> = {}
    savedOrders.forEach((order: Order) => {
      order.items.forEach((item) => {
        const productName = item.product.name
        if (summary[productName]) {
          summary[productName] += item.quantity
        } else {
          summary[productName] = item.quantity
        }
      })
    })
    setProductSummary(summary)

    // Group orders by customer
    const customerGrouped: Record<string, Order[]> = {}
    savedOrders.forEach((order: Order) => {
      const customerName = order.customer.name
      if (customerGrouped[customerName]) {
        customerGrouped[customerName].push(order)
      } else {
        customerGrouped[customerName] = [order]
      }
    })
    setCustomerOrders(customerGrouped)

    setIsLoading(false)
  }, [router])

  const [productSummary, setProductSummary] = useState<Record<string, number>>({})
  const [customerOrders, setCustomerOrders] = useState<Record<string, Order[]>>({})

  // Add saving state for UI feedback
  const [isSavingBanner, setIsSavingBanner] = useState(false)
  const [isSavingContact, setIsSavingContact] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    router.push("/admin/login")
  }

  // Calculate item price including add-ons
  const calculateItemPrice = (product: Product, productAddons: SelectedAddOn[]) => {
    const basePrice = product.price
    const addonsPrice = productAddons.reduce((sum, addon) => {
      return sum + addon.addon.price * addon.quantity
    }, 0)

    return basePrice + addonsPrice
  }

  // Product management functions
  const openEditDialog = (product: Product) => {
    setCurrentProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      available: product.available !== false,
      applicableAddons: product.applicableAddons || [],
      eventOnly: product.eventOnly || false,
      eventId: product.eventId,
    })
    setIsEditDialogOpen(true)
  }

  const openAddDialog = () => {
    // Generate a new unique ID
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1

    setCurrentProduct({
      id: newId,
      name: "",
      description: "",
      price: "",
      image: "/placeholder.svg?height=200&width=200",
      available: true,
      applicableAddons: [],
      eventOnly: false,
      eventId: undefined,
    })
    setIsAddDialogOpen(true)
  }

  // Update the product form handlers to include event-related fields
  // Modify the handleProductInputChange function to handle event-related fields
  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentProduct((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (name in formErrors) {
      setFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleAvailabilityChange = (checked: boolean) => {
    setCurrentProduct((prev) => ({ ...prev, available: checked }))
  }

  const handleEventOnlyChange = (checked: boolean) => {
    setCurrentProduct((prev) => ({
      ...prev,
      eventOnly: checked,
      // Clear eventId if eventOnly is unchecked
      eventId: checked ? prev.eventId : undefined,
    }))
  }

  const handleEventIdChange = (value: string) => {
    setCurrentProduct((prev) => ({
      ...prev,
      eventId: value ? Number(value) : undefined,
    }))
  }

  const handleAddonToggle = (addonId: number) => {
    setCurrentProduct((prev) => {
      const currentAddons = prev.applicableAddons || []
      if (currentAddons.includes(addonId)) {
        return {
          ...prev,
          applicableAddons: currentAddons.filter((id) => id !== addonId),
        }
      } else {
        return {
          ...prev,
          applicableAddons: [...currentAddons, addonId],
        }
      }
    })
  }

  const validateProductForm = () => {
    const errors = {
      name: !currentProduct.name.trim(),
      description: !currentProduct.description.trim(),
      price:
        !currentProduct.price.trim() ||
        isNaN(Number.parseFloat(currentProduct.price)) ||
        Number.parseFloat(currentProduct.price) <= 0,
      image: !currentProduct.image.trim(),
    }

    setFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  // Update the saveProduct function to include event-related fields
  // Modify the saveProduct function to use the API
  // Update the saveProduct function to reset the product list after adding/editing
  const saveProduct = async () => {
    if (!validateProductForm()) return

    const productData = {
      name: currentProduct.name,
      description: currentProduct.description,
      price: Number.parseFloat(Number.parseFloat(currentProduct.price).toFixed(2)),
      image: currentProduct.image,
      available: currentProduct.available,
      applicableAddons: currentProduct.applicableAddons,
      eventOnly: currentProduct.eventOnly,
      eventId: currentProduct.eventId,
    }

    try {
      let savedProduct;

      // Check if we're in edit mode or add mode
      if (isEditDialogOpen) {
        // Update existing product - ID is in the URL, not the body
        savedProduct = await fetchApi<Product>(`products/${currentProduct.id}`, {
          method: "PUT",
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product - server will generate ID
        savedProduct = await fetchApi<Product>("products", {
          method: "POST",
          body: JSON.stringify(productData),
        });
      }

      // Reset the products list to fetch updated data
      resetProducts()

      // Close dialogs
      setIsEditDialogOpen(false)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Failed to save product. Please try again.")
    }
  }

  // Update the deleteProduct function
  const deleteProduct = async (productId: number) => {
    try {
      await fetchApi<void>(`products/${productId}`, {
        method: "DELETE",
      });

      // Reset the products list to fetch updated data
      resetProducts()

      // Also reset add-ons list
      resetAddons()
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Failed to delete product. Please try again.")
    }
  }

  // Add event management functions after the product management functions (around line 350)
  // Event management functions
  const openEditEventDialog = (event: Event) => {
    setCurrentEvent({
      ...event,
    })
    setIsEditEventDialogOpen(true)
  }

  const openAddEventDialog = () => {
    // Generate a new unique ID
    const newId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1

    setCurrentEvent({
      id: newId,
      name: "",
      description: "",
      date: new Date().toISOString(),
      endDate: "",
      location: "",
      image: "/placeholder.svg?height=300&width=600",
      active: true,
      featured: false,
    })
    setIsAddEventDialogOpen(true)
  }

  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentEvent((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (name in eventFormErrors) {
      setEventFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleEventActiveChange = (checked: boolean) => {
    setCurrentEvent((prev) => ({ ...prev, active: checked }))
  }

  const handleEventFeaturedChange = (checked: boolean) => {
    setCurrentEvent((prev) => ({ ...prev, featured: checked }))
  }

  const validateEventForm = () => {
    const errors = {
      name: !currentEvent.name.trim(),
      description: !currentEvent.description.trim(),
      date: !currentEvent.date.trim(),
      location: !currentEvent.location.trim(),
      image: !currentEvent.image.trim(),
    }

    setEventFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  // Update the saveEvent function
  const saveEvent = async () => {
    if (!validateEventForm()) return

    const eventData = {
      name: currentEvent.name,
      description: currentEvent.description,
      date: currentEvent.date,
      endDate: currentEvent.endDate?.trim() || undefined,
      location: currentEvent.location,
      image: currentEvent.image,
      active: currentEvent.active,
      featured: currentEvent.featured,
    }

    try {
      let savedEvent;

      // Check if we're in edit mode or add mode
      if (isEditEventDialogOpen) {
        // Update existing event - ID is in the URL, not the body
        savedEvent = await fetchApi<Event>(`events/${currentEvent.id}`, {
          method: "PUT",
          body: JSON.stringify(eventData),
        });
      } else {
        // Create new event - server will generate ID
        savedEvent = await fetchApi<Event>("events", {
          method: "POST",
          body: JSON.stringify(eventData),
        });
      }

      // Reset the events list to fetch updated data
      resetEvents()

      // Close dialogs
      setIsEditEventDialogOpen(false)
      setIsAddEventDialogOpen(false)

      alert("Event saved successfully!")
    } catch (error) {
      console.error("Error saving event:", error)
      alert("Failed to save event. Please try again.")
    }
  }

  // Update the deleteEvent function
  const deleteEvent = async (eventId: number) => {
    // Check if any products are associated with this event
    const associatedProducts = products.filter((p) => p.eventOnly && p.eventId === eventId)

    if (associatedProducts.length > 0) {
      if (
        !confirm(
          `This event has ${associatedProducts.length} associated products. Deleting it will remove the event association from these products. Continue?`
        )
      ) {
        return
      }

      // Update products to remove event association
      try {
        for (const product of associatedProducts) {
          const updatedProduct = {
            ...product,
            eventOnly: false,
            eventId: undefined,
          }

          await fetchApi<Product>(`products/${product.id}`, {
            method: "PUT",
            body: JSON.stringify(updatedProduct),
          });
        }
      } catch (error) {
        console.error("Error updating associated products:", error)
        alert("Failed to update associated products. Please try again.")
        return
      }
    }

    try {
      await fetchApi<void>(`events/${eventId}`, {
        method: "DELETE",
      });

      // Reset the events list to fetch updated data
      resetEvents()

      // Also reset products as they may have event associations
      resetProducts()

      alert("Event deleted successfully!")
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event. Please try again.")
    }
  }

  // Add-on management functions
  const openEditAddonDialog = (addon: AddOn) => {
    setCurrentAddon({
      id: addon.id,
      name: addon.name,
      description: addon.description,
      price: addon.price.toString(),
      available: addon.available !== false,
      applicableProducts: addon.applicableProducts || [],
    })
    setIsEditAddonDialogOpen(true)
  }

  const openAddAddonDialog = () => {
    // Generate a new unique ID
    const newId = addons.length > 0 ? Math.max(...addons.map((a) => a.id)) + 1 : 1

    setCurrentAddon({
      id: newId,
      name: "",
      description: "",
      price: "",
      available: true,
      applicableProducts: [],
    })
    setIsAddAddonDialogOpen(true)
  }

  const handleAddonInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentAddon((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (name in addonFormErrors) {
      setAddonFormErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  const handleAddonAvailabilityChange = (checked: boolean) => {
    setCurrentAddon((prev) => ({ ...prev, available: checked }))
  }

  const handleProductToggle = (productId: number) => {
    setCurrentAddon((prev) => {
      const currentProducts = prev.applicableProducts || []
      if (currentProducts.includes(productId)) {
        return {
          ...prev,
          applicableProducts: currentProducts.filter((id) => id !== productId),
        }
      } else {
        return {
          ...prev,
          applicableProducts: [...currentProducts, productId],
        }
      }
    })
  }

  const validateAddonForm = () => {
    const errors = {
      name: !currentAddon.name.trim(),
      description: !currentAddon.description.trim(),
      price:
        !currentAddon.price.trim() ||
        isNaN(Number.parseFloat(currentAddon.price)) ||
        Number.parseFloat(currentAddon.price) <= 0,
    }

    setAddonFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  // Update the saveAddon function
  const saveAddon = async () => {
    if (!validateAddonForm()) return

    const addonData = {
      name: currentAddon.name,
      description: currentAddon.description,
      price: Number.parseFloat(Number.parseFloat(currentAddon.price).toFixed(2)),
      available: currentAddon.available,
      applicableProducts: currentAddon.applicableProducts,
    }

    try {
      let savedAddon;

      // Check if we're in edit mode or add mode
      if (isEditAddonDialogOpen) {
        // Update existing add-on - ID is in the URL, not the body
        savedAddon = await fetchApi<AddOn>(`addons/${currentAddon.id}`, {
          method: "PUT",
          body: JSON.stringify(addonData),
        });
      } else {
        // Create new add-on - server will generate ID
        savedAddon = await fetchApi<AddOn>("addons", {
          method: "POST",
          body: JSON.stringify(addonData),
        });
      }

      // Reset the add-ons list to fetch updated data
      resetAddons()

      // Close dialogs
      setIsEditAddonDialogOpen(false)
      setIsAddAddonDialogOpen(false)
    } catch (error) {
      console.error("Error saving add-on:", error)
      alert("Failed to save add-on. Please try again.")
    }
  }

  // Update the deleteAddon function
  const deleteAddon = async (addonId: number) => {
    try {
      console.log(`Attempting to delete add-on with ID: ${addonId}`)

      await fetchApi<void>(`addons/${addonId}`, {
        method: "DELETE",
      });

      // Reset the add-ons list to fetch updated data
      resetAddons()

      // Reset products to update the applicable add-ons
      resetProducts()

      alert("Add-on deleted successfully!")
    } catch (error) {
      console.error("Error deleting add-on:", error)
      alert(`Failed to delete add-on: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  // Banner management functions
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBanner((prev) => ({ ...prev, [name]: value }))
  }

  const handleBannerEnabledChange = (checked: boolean) => {
    setBanner((prev) => ({ ...prev, enabled: checked }))
  }

  // Update the saveBanner function
  const saveBanner = async () => {
    setIsSavingBanner(true)
    try {
      // Save to API
      await fetchApi<Banner>("banner", {
        method: "PUT",
        body: JSON.stringify(banner),
      });

      // Also save to localStorage as fallback
      localStorage.setItem("pastryBanner", JSON.stringify(banner))
      alert("Banner settings saved successfully!")
    } catch (error) {
      console.error("Error saving banner:", error)
      alert(`Failed to save banner settings to API. Saved locally only: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Still save to localStorage even if API fails
      localStorage.setItem("pastryBanner", JSON.stringify(banner))
    } finally {
      setIsSavingBanner(false)
    }
  }

  // Contact info management functions
  const handleContactInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setContactInfo((prev) => ({ ...prev, [name]: value }))
  }

  // Update the saveContactInfo function
  const saveContactInfo = async () => {
    setIsSavingContact(true)
    try {
      // Save to API
      await fetchApi<ContactInfo>("contact", {
        method: "PUT",
        body: JSON.stringify(contactInfo),
      });

      // Also save to localStorage as fallback
      localStorage.setItem("pastryContactInfo", JSON.stringify(contactInfo))
      alert("Contact information saved successfully!")
    } catch (error) {
      console.error("Error saving contact info:", error)
      alert(`Failed to save contact info to API. Saved locally only: ${error instanceof Error ? error.message : "Unknown error"}`)
      // Still save to localStorage even if API fails
      localStorage.setItem("pastryContactInfo", JSON.stringify(contactInfo))
    } finally {
      setIsSavingContact(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage orders and view statistics</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(customerOrders).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items Sold</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.values(productSummary).reduce((sum, qty) => sum + qty, 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="inventory" className="flex-grow sm:flex-grow-0">
            <Package className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Inventory View</span>
            <span className="sm:hidden">Inventory</span>
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex-grow sm:flex-grow-0">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Customer View</span>
            <span className="sm:hidden">Customers</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex-grow sm:flex-grow-0">
            <BarChart3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Order Details</span>
            <span className="sm:hidden">Orders</span>
          </TabsTrigger>
          <TabsTrigger value="products" className="flex-grow sm:flex-grow-0">
            <ShoppingBag className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Manage Products</span>
            <span className="sm:hidden">Products</span>
          </TabsTrigger>
          <TabsTrigger value="addons" className="flex-grow sm:flex-grow-0">
            <PlusCircle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Manage Add-ons</span>
            <span className="sm:hidden">Add-ons</span>
          </TabsTrigger>
          {/* Add a new TabsTrigger for Events in the TabsList (around line 600) */}
          {/* Find the TabsList and add a new TabsTrigger for Events after the "addons" TabsTrigger */}
          <TabsTrigger value="events" className="flex-grow sm:flex-grow-0">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Manage Events</span>
            <span className="sm:hidden">Events</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-grow sm:flex-grow-0">
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Store Settings</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Summary</CardTitle>
              <CardDescription>Total quantity of each item ordered across all orders</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(productSummary).length === 0 ? (
                <p className="text-muted-foreground">No items have been ordered yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(productSummary).map(([productName, quantity]) => (
                    <Card key={productName}>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{productName}</p>
                          <p className="text-sm text-muted-foreground">Quantity sold</p>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {quantity}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Orders</CardTitle>
              <CardDescription>Orders grouped by customer</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(customerOrders).length === 0 ? (
                <p className="text-muted-foreground">No customer orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {Object.entries(customerOrders).map(([customerName, customerOrders]) => (
                    <div key={customerName} className="space-y-3">
                      <h3 className="text-lg font-semibold">{customerName}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {customerOrders.map((order) => (
                          <Card key={order.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="text-sm text-muted-foreground">Order #{order.id.slice(-4)}</p>
                                  <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
                                </div>
                                <Badge>${order.total.toFixed(2)}</Badge>
                              </div>
                              <Separator className="my-2" />
                              <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span>{item.product.name}</span>
                                    <span>x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>Complete information for each order</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardHeader className="bg-muted/50">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Order #{order.id.slice(-4)}</CardTitle>
                          <Badge>${order.total.toFixed(2)}</Badge>
                        </div>
                        <CardDescription>{formatDate(order.date)}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-2">Customer Information</h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Name:</span> {order.customer.name}
                              </p>
                              <p>
                                <span className="font-medium">Email:</span> {order.customer.email}
                              </p>
                              <p>
                                <span className="font-medium">Phone:</span> {order.customer.phone}
                              </p>
                              <p>
                                <span className="font-medium">Preferred Contact:</span>{" "}
                                {order.customer.contactMethod === "phone"
                                  ? "Phone Call"
                                  : order.customer.contactMethod === "whatsapp"
                                    ? "WhatsApp"
                                    : "Email"}
                              </p>
                              <p>
                                <span className="font-medium">Delivery:</span> {order.customer.delivery ? "Yes" : "No"}
                              </p>
                              {order.customer.delivery && (
                                <p>
                                  <span className="font-medium">Delivery Address:</span> <br />
                                  {order.customer.deliveryAddress}
                                </p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Order Items</h4>
                            <div className="space-y-3">
                              {order.items.map((item, idx) => (
                                <div key={idx}>
                                  <div className="flex justify-between">
                                    <div>
                                      <p className="font-medium">{item.product.name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        ${calculateItemPrice(item.product, item.addons).toFixed(2)} x {item.quantity}
                                      </p>
                                      {item.notes && <p className="text-sm italic">Note: {item.notes}</p>}
                                    </div>
                                    <p className="font-medium">
                                      ${(calculateItemPrice(item.product, item.addons) * item.quantity).toFixed(2)}
                                    </p>
                                  </div>

                                  {/* Display add-ons */}
                                  {item.addons && item.addons.length > 0 && (
                                    <div className="mt-2 pl-4 border-l-2 border-muted">
                                      {item.addons.map((addon, addonIdx) => (
                                        <div key={addonIdx} className="flex justify-between text-sm mt-1">
                                          <div>
                                            <p className="text-sm">
                                              {addon.addon.name} × {addon.quantity}
                                            </p>
                                            {addon.notes && (
                                              <p className="text-xs text-muted-foreground italic">
                                                Note: {addon.notes}
                                              </p>
                                            )}
                                          </div>
                                          <p className="text-sm">${(addon.addon.price * addon.quantity).toFixed(2)}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Separator className="my-2" />
                              <div className="flex justify-between font-bold">
                                <p>Total</p>
                                <p>${order.total.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Add, edit, or remove products available for order</CardDescription>
              </div>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No products available.</p>
                  <Button onClick={openAddDialog}>Add Your First Product</Button>
                </div>
              ) : (
                // Add the loader to the products grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <Card key={product.id} className={product.available === false ? "opacity-60" : ""}>
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        {/* Update the product card to show event information (around line 800) */}
                        {/* Find the product card in the products TabsContent and add event information */}
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="font-medium">${product.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant={product.available !== false ? "default" : "secondary"}>
                            {product.available !== false ? "Available" : "Unavailable"}
                          </Badge>
                          {product.eventOnly && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                              Event Only
                            </Badge>
                          )}
                          {product.eventOnly && product.eventId && (
                            <Badge variant="outline" className="text-xs">
                              {events.find((e) => e.id === product.eventId)?.name || "Unknown Event"}
                            </Badge>
                          )}
                        </div>

                        {/* Show applicable add-ons */}
                        {product.applicableAddons && product.applicableAddons.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Add-ons:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {product.applicableAddons.map((addonId) => {
                                const addon = addons.find((a) => a.id === addonId)
                                return addon ? (
                                  <Badge key={addonId} variant="outline" className="text-xs">
                                    {addon.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the product "{product.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProduct(product.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}

                  {/* Loader for infinite scrolling */}
                  {hasMoreProducts && (
                    <div ref={productsLoaderRef} className="col-span-full py-4 flex justify-center">
                      {loadingProducts && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addons" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Add-ons</CardTitle>
                <CardDescription>Add, edit, or remove add-ons for product customization</CardDescription>
              </div>
              <Button onClick={openAddAddonDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Add-on
              </Button>
            </CardHeader>
            <CardContent>
              {addons.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No add-ons available.</p>
                  <Button onClick={openAddAddonDialog}>Add Your First Add-on</Button>
                </div>
              ) : (
                // Add the loader to the add-ons grid
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addons.map((addon) => (
                    <Card key={addon.id} className={addon.available === false ? "opacity-60" : ""}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{addon.name}</h3>
                          <p className="font-medium">${addon.price.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{addon.description}</p>
                        <Badge variant={addon.available !== false ? "default" : "secondary"}>
                          {addon.available !== false ? "Available" : "Unavailable"}
                        </Badge>

                        {/* Show applicable products */}
                        {addon.applicableProducts && addon.applicableProducts.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Applicable to:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {addon.applicableProducts.map((productId) => {
                                const product = products.find((p) => p.id === productId)
                                return product ? (
                                  <Badge key={productId} variant="outline" className="text-xs">
                                    {product.name}
                                  </Badge>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => openEditAddonDialog(addon)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the add-on "{addon.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAddon(addon.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}

                  {/* Loader for infinite scrolling */}
                  {hasMoreAddons && (
                    <div ref={addonsLoaderRef} className="col-span-full py-4 flex justify-center">
                      {loadingAddons && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Add a new TabsContent for Events after the "addons" TabsContent (around line 1100) */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Manage Events</CardTitle>
                <CardDescription>Add, edit, or remove events and special occasions</CardDescription>
              </div>
              <Button onClick={openAddEventDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No events available.</p>
                  <Button onClick={openAddEventDialog}>Add Your First Event</Button>
                </div>
              ) : (
                // Add the loader to the events grid
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <Card key={event.id} className={event.active === false ? "opacity-60" : ""}>
                      <div className="aspect-video w-full overflow-hidden">
                        <img
                          src={event.image || "/placeholder.svg?height=300&width=600"}
                          alt={event.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.name}</h3>
                          <div className="flex gap-1">
                            {event.featured && <Badge variant="secondary">Featured</Badge>}
                            <Badge variant={event.active !== false ? "default" : "secondary"}>
                              {event.active !== false ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                        <div className="text-sm text-muted-foreground mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {event.endDate
                                ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                                : formatDate(event.date)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        {/* Show associated products */}
                        {(() => {
                          const associatedProducts = products.filter((p) => p.eventOnly && p.eventId === event.id)
                          return associatedProducts.length > 0 ? (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Event Products:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {associatedProducts.map((product) => (
                                  <Badge key={product.id} variant="outline" className="text-xs">
                                    {product.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : null
                        })()}
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => openEditEventDialog(event)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the event "{event.name}". This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteEvent(event.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}

                  {/* Loader for infinite scrolling */}
                  {hasMoreEvents && (
                    <div ref={eventsLoaderRef} className="col-span-full py-4 flex justify-center">
                      {loadingEvents && (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Banner Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Banner Settings</CardTitle>
              <CardDescription>Configure the promotional banner on the main page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="banner-enabled" checked={banner.enabled} onCheckedChange={handleBannerEnabledChange} />
                <Label htmlFor="banner-enabled">Show banner on main page</Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Banner Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={banner.imageUrl}
                  onChange={handleBannerChange}
                  placeholder="https://example.com/banner.jpg"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a URL for the banner image. You can use "/placeholder.svg?height=400&width=1200" for a
                  placeholder.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="title">Banner Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={banner.title}
                  onChange={handleBannerChange}
                  placeholder="Special Promotion"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Banner Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={banner.description}
                  onChange={handleBannerChange}
                  placeholder="Describe your promotion or special event"
                  rows={3}
                />
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Banner Preview</h3>
                <div className="rounded-lg overflow-hidden border">
                  <div className="relative">
                    <img
                      src={banner.imageUrl || "/placeholder.svg?height=400&width=1200"}
                      alt="Banner Preview"
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-end p-4">
                      <h2 className="text-white text-lg font-bold mb-1">{banner.title}</h2>
                      <p className="text-white/90 text-sm">{banner.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveBanner} disabled={isSavingBanner}>
                {isSavingBanner ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Save Banner Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Update your social media and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="instagram" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" /> Instagram Username
                </Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={contactInfo.instagram}
                  onChange={handleContactInfoChange}
                  placeholder="yourbakery"
                />
                <p className="text-xs text-muted-foreground">Enter your Instagram username without the @ symbol</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="whatsapp" className="flex items-center gap-2">
                  <WhatsApp className="h-4 w-4" /> WhatsApp Number
                </Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  value={contactInfo.whatsapp}
                  onChange={handleContactInfoChange}
                  placeholder="+1234567890"
                />
                <p className="text-xs text-muted-foreground">Include the country code (e.g., +1 for US)</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={contactInfo.email}
                  onChange={handleContactInfoChange}
                  placeholder="info@yourbakery.com"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveContactInfo} disabled={isSavingContact}>
                {isSavingContact ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    Saving...
                  </>
                ) : (
                  "Save Contact Information"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Make changes to the product details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={currentProduct.name}
                onChange={handleProductInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-red-500 text-sm">Product name is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={currentProduct.description}
                onChange={handleProductInputChange}
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={currentProduct.price}
                onChange={handleProductInputChange}
                className={formErrors.price ? "border-red-500" : ""}
              />
              {formErrors.price && <p className="text-red-500 text-sm">Valid price is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                name="image"
                value={currentProduct.image}
                onChange={handleProductInputChange}
                className={formErrors.image ? "border-red-500" : ""}
              />
              {formErrors.image && <p className="text-red-500 text-sm">Image URL is required</p>}
              <p className="text-xs text-muted-foreground">
                Enter a URL for the product image. You can use "/placeholder.svg?height=200&width=200" for a
                placeholder.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="available" checked={currentProduct.available} onCheckedChange={handleAvailabilityChange} />
              <Label htmlFor="available">Available for order</Label>
            </div>

            {/* Add event-related fields to the product form (around line 1600) */}
            {/* Find the Edit Product Dialog and add event-related fields before the add-ons selection */}
            {/* Event-related fields */}
            <div className="space-y-4 mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Event Settings</h4>

              <div className="flex items-center space-x-2">
                <Switch id="eventOnly" checked={currentProduct.eventOnly} onCheckedChange={handleEventOnlyChange} />
                <Label htmlFor="eventOnly">This is an event-only product</Label>
              </div>

              {currentProduct.eventOnly && (
                <div className="grid gap-2">
                  <Label htmlFor="eventId">Select Event</Label>
                  <select
                    id="eventId"
                    name="eventId"
                    value={currentProduct.eventId?.toString() || ""}
                    onChange={(e) => handleEventIdChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an event</option>
                    {events
                      .filter((e) => e.active !== false)
                      .map((event) => (
                        <option key={event.id} value={event.id.toString()}>
                          {event.name}
                        </option>
                      ))}
                  </select>
                  {currentProduct.eventOnly && !currentProduct.eventId && (
                    <p className="text-amber-500 text-sm">Please select an event for this event-only product</p>
                  )}
                </div>
              )}
            </div>

            {/* Add-ons selection */}
            {addons.length > 0 && (
              <div className="grid gap-2 mt-2">
                <Label>Available Add-ons</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`addon-${addon.id}`}
                        checked={(currentProduct.applicableAddons || []).includes(addon.id)}
                        onCheckedChange={() => handleAddonToggle(addon.id)}
                      />
                      <Label htmlFor={`addon-${addon.id}`} className="text-sm">
                        {addon.name} (${addon.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Select which add-ons can be applied to this product</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Enter the details for the new product.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Product Name</Label>
              <Input
                id="add-name"
                name="name"
                value={currentProduct.name}
                onChange={handleProductInputChange}
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && <p className="text-red-500 text-sm">Product name is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-description">Description</Label>
              <Textarea
                id="add-description"
                name="description"
                value={currentProduct.description}
                onChange={handleProductInputChange}
                className={formErrors.description ? "border-red-500" : ""}
              />
              {formErrors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-price">Price ($)</Label>
              <Input
                id="add-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={currentProduct.price}
                onChange={handleProductInputChange}
                className={formErrors.price ? "border-red-500" : ""}
              />
              {formErrors.price && <p className="text-red-500 text-sm">Valid price is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-image">Image URL</Label>
              <Input
                id="add-image"
                name="image"
                value={currentProduct.image}
                onChange={handleProductInputChange}
                className={formErrors.image ? "border-red-500" : ""}
              />
              {formErrors.image && <p className="text-red-500 text-sm">Image URL is required</p>}
              <p className="text-xs text-muted-foreground">
                Enter a URL for the product image. You can use "/placeholder.svg?height=200&width=200" for a
                placeholder.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="add-available"
                checked={currentProduct.available}
                onCheckedChange={handleAvailabilityChange}
              />
              <Label htmlFor="add-available">Available for order</Label>
            </div>

            {/* Add the same event-related fields to the Add Product Dialog (around line 1700) */}
            {/* Find the Add Product Dialog and add the same event-related fields before the add-ons selection */}
            {/* Event-related fields */}
            <div className="space-y-4 mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm">Event Settings</h4>

              <div className="flex items-center space-x-2">
                <Switch id="add-eventOnly" checked={currentProduct.eventOnly} onCheckedChange={handleEventOnlyChange} />
                <Label htmlFor="add-eventOnly">This is an event-only product</Label>
              </div>

              {currentProduct.eventOnly && (
                <div className="grid gap-2">
                  <Label htmlFor="add-eventId">Select Event</Label>
                  <select
                    id="add-eventId"
                    name="eventId"
                    value={currentProduct.eventId?.toString() || ""}
                    onChange={(e) => handleEventIdChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select an event</option>
                    {events
                      .filter((e) => e.active !== false)
                      .map((event) => (
                        <option key={event.id} value={event.id.toString()}>
                          {event.name}
                        </option>
                      ))}
                  </select>
                  {currentProduct.eventOnly && !currentProduct.eventId && (
                    <p className="text-amber-500 text-sm">Please select an event for this event-only product</p>
                  )}
                </div>
              )}
            </div>

            {/* Add-ons selection */}
            {addons.length > 0 && (
              <div className="grid gap-2 mt-2">
                <Label>Available Add-ons</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {addons.map((addon) => (
                    <div key={addon.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-addon-${addon.id}`}
                        checked={(currentProduct.applicableAddons || []).includes(addon.id)}
                        onCheckedChange={() => handleAddonToggle(addon.id)}
                      />
                      <Label htmlFor={`new-addon-${addon.id}`} className="text-sm">
                        {addon.name} (${addon.price.toFixed(2)})
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Select which add-ons can be applied to this product</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Add-on Dialog */}
      <Dialog open={isEditAddonDialogOpen} onOpenChange={setIsEditAddonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Add-on</DialogTitle>
            <DialogDescription>Make changes to the add-on details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="addon-name">Add-on Name</Label>
              <Input
                id="addon-name"
                name="name"
                value={currentAddon.name}
                onChange={handleAddonInputChange}
                className={addonFormErrors.name ? "border-red-500" : ""}
              />
              {addonFormErrors.name && <p className="text-red-500 text-sm">Add-on name is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addon-description">Description</Label>
              <Textarea
                id="addon-description"
                name="description"
                value={currentAddon.description}
                onChange={handleAddonInputChange}
                className={addonFormErrors.description ? "border-red-500" : ""}
              />
              {addonFormErrors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="addon-price">Price ($)</Label>
              <Input
                id="addon-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={currentAddon.price}
                onChange={handleAddonInputChange}
                className={addonFormErrors.price ? "border-red-500" : ""}
              />
              {addonFormErrors.price && <p className="text-red-500 text-sm">Valid price is required</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="addon-available"
                checked={currentAddon.available}
                onCheckedChange={handleAddonAvailabilityChange}
              />
              <Label htmlFor="addon-available">Available for selection</Label>
            </div>

            {/* Products selection */}
            {products.length > 0 && (
              <div className="grid gap-2 mt-2">
                <Label>Applicable Products</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={(currentAddon.applicableProducts || []).includes(product.id)}
                        onCheckedChange={() => handleProductToggle(product.id)}
                      />
                      <Label htmlFor={`product-${product.id}`} className="text-sm">
                        {product.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Select which products this add-on can be applied to</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAddonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAddon}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Add-on Dialog */}
      <Dialog open={isAddAddonDialogOpen} onOpenChange={setIsAddAddonDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Add-on</DialogTitle>
            <DialogDescription>Enter the details for the new add-on.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-addon-name">Add-on Name</Label>
              <Input
                id="new-addon-name"
                name="name"
                value={currentAddon.name}
                onChange={handleAddonInputChange}
                className={addonFormErrors.name ? "border-red-500" : ""}
              />
              {addonFormErrors.name && <p className="text-red-500 text-sm">Add-on name is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-addon-description">Description</Label>
              <Textarea
                id="new-addon-description"
                name="description"
                value={currentAddon.description}
                onChange={handleAddonInputChange}
                className={addonFormErrors.description ? "border-red-500" : ""}
              />
              {addonFormErrors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-addon-price">Price ($)</Label>
              <Input
                id="new-addon-price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={currentAddon.price}
                onChange={handleAddonInputChange}
                className={addonFormErrors.price ? "border-red-500" : ""}
              />
              {addonFormErrors.price && <p className="text-red-500 text-sm">Valid price is required</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="new-addon-available"
                checked={currentAddon.available}
                onCheckedChange={handleAddonAvailabilityChange}
              />
              <Label htmlFor="new-addon-available">Available for selection</Label>
            </div>

            {/* Products selection */}
            {products.length > 0 && (
              <div className="grid gap-2 mt-2">
                <Label>Applicable Products</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`new-product-${product.id}`}
                        checked={(currentAddon.applicableProducts || []).includes(product.id)}
                        onCheckedChange={() => handleProductToggle(product.id)}
                      />
                      <Label htmlFor={`new-product-${product.id}`} className="text-sm">
                        {product.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Select which products this add-on can be applied to</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddAddonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveAddon}>Add Add-on</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add the Edit Event Dialog and Add Event Dialog at the end of the file (after all other dialogs) */}
      {/* Edit Event Dialog */}
      <Dialog open={isEditEventDialogOpen} onOpenChange={setIsEditEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Make changes to the event details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                name="name"
                value={currentEvent.name}
                onChange={handleEventInputChange}
                className={eventFormErrors.name ? "border-red-500" : ""}
              />
              {eventFormErrors.name && <p className="text-red-500 text-sm">Event name is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                name="description"
                value={currentEvent.description}
                onChange={handleEventInputChange}
                className={eventFormErrors.description ? "border-red-500" : ""}
              />
              {eventFormErrors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-date">Start Date</Label>
              <Input
                id="event-date"
                name="date"
                type="datetime-local"
                value={currentEvent.date.slice(0, 16)}
                onChange={handleEventInputChange}
                className={eventFormErrors.date ? "border-red-500" : ""}
              />
              {eventFormErrors.date && <p className="text-red-500 text-sm">Start date is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-endDate">End Date (Optional)</Label>
              <Input
                id="event-endDate"
                name="endDate"
                type="datetime-local"
                value={currentEvent.endDate?.slice(0, 16) || ""}
                onChange={handleEventInputChange}
              />
              <p className="text-xs text-muted-foreground">Leave empty for single-day events</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                name="location"
                value={currentEvent.location}
                onChange={handleEventInputChange}
                className={eventFormErrors.location ? "border-red-500" : ""}
              />
              {eventFormErrors.location && <p className="text-red-500 text-sm">Location is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="event-image">Image URL</Label>
              <Input
                id="event-image"
                name="image"
                value={currentEvent.image}
                onChange={handleEventInputChange}
                className={eventFormErrors.image ? "border-red-500" : ""}
              />
              {eventFormErrors.image && <p className="text-red-500 text-sm">Image URL is required</p>}
              <p className="text-xs text-muted-foreground">
                Enter a URL for the event image. You can use "/placeholder.svg?height=300&width=600" for a placeholder.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="event-active" checked={currentEvent.active} onCheckedChange={handleEventActiveChange} />
              <Label htmlFor="event-active">Active event</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="event-featured" checked={currentEvent.featured} onCheckedChange={handleEventFeaturedChange} />
              <Label htmlFor="event-featured">Featured on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEvent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventDialogOpen} onOpenChange={setIsAddEventDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Enter the details for the new event.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-event-name">Event Name</Label>
              <Input
                id="add-event-name"
                name="name"
                value={currentEvent.name}
                onChange={handleEventInputChange}
                className={eventFormErrors.name ? "border-red-500" : ""}
              />
              {eventFormErrors.name && <p className="text-red-500 text-sm">Event name is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-event-description">Description</Label>
              <Textarea
                id="add-event-description"
                name="description"
                value={currentEvent.description}
                onChange={handleEventInputChange}
                className={eventFormErrors.description ? "border-red-500" : ""}
              />
              {eventFormErrors.description && <p className="text-red-500 text-sm">Description is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-event-date">Start Date</Label>
              <Input
                id="add-event-date"
                name="date"
                type="datetime-local"
                value={currentEvent.date.slice(0, 16)}
                onChange={handleEventInputChange}
                className={eventFormErrors.date ? "border-red-500" : ""}
              />
              {eventFormErrors.date && <p className="text-red-500 text-sm">Start date is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-event-endDate">End Date (Optional)</Label>
              <Input
                id="add-event-endDate"
                name="endDate"
                type="datetime-local"
                value={currentEvent.endDate?.slice(0, 16) || ""}
                onChange={handleEventInputChange}
              />
              <p className="text-xs text-muted-foreground">Leave empty for single-day events</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-event-location">Location</Label>
              <Input
                id="add-event-location"
                name="location"
                value={currentEvent.location}
                onChange={handleEventInputChange}
                className={eventFormErrors.location ? "border-red-500" : ""}
              />
              {eventFormErrors.location && <p className="text-red-500 text-sm">Location is required</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-event-image">Image URL</Label>
              <Input
                id="add-event-image"
                name="image"
                value={currentEvent.image}
                onChange={handleEventInputChange}
                className={eventFormErrors.image ? "border-red-500" : ""}
              />
              {eventFormErrors.image && <p className="text-red-500 text-sm">Image URL is required</p>}
              <p className="text-xs text-muted-foreground">
                Enter a URL for the event image. You can use "/placeholder.svg?height=300&width=600" for a placeholder.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="add-event-active" checked={currentEvent.active} onCheckedChange={handleEventActiveChange} />
              <Label htmlFor="add-event-active">Active event</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="add-event-featured"
                checked={currentEvent.featured}
                onCheckedChange={handleEventFeaturedChange}
              />
              <Label htmlFor="add-event-featured">Featured on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEventDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveEvent}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
