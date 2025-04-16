// Product type definition
export type Product = {
  id: number
  name: string
  description: string
  price: number
  image: string
  available?: boolean
  applicableAddons?: number[] // IDs of applicable add-ons
  eventOnly?: boolean // Flag for event-only products
  eventId?: number // ID of the event this product is associated with (if eventOnly)
}

// Update the ProductFormData type to include event-related fields
// Add this type definition after the Product type
export type ProductFormData = {
  id: number
  name: string
  description: string
  price: string
  image: string
  available: boolean
  applicableAddons?: number[]
  eventOnly?: boolean
  eventId?: number
}

// Add-on type definition
export type AddOn = {
  id: number
  name: string
  description: string
  price: number
  applicableProducts?: number[] // IDs of products this add-on can be applied to
  available?: boolean
}

// Selected add-on type definition
export type SelectedAddOn = {
  addon: AddOn
  quantity: number
  notes: string
}

// Cart add-on type definition (using ID instead of full object)
export type CartAddOn = {
  addonId: number
  quantity: number
  notes: string
}

// Event type definition
export type Event = {
  id: number
  name: string
  description: string
  date: string // ISO date string
  endDate?: string // Optional end date for multi-day events
  location: string
  image: string
  active: boolean
  featured?: boolean // Whether to feature this event prominently
}

// Cart item type definition
export type CartItem = {
  productId: number
  quantity: number
  notes: string
  addons: CartAddOn[]
}

// Banner type definition
export type Banner = {
  enabled: boolean
  imageUrl: string
  title: string
  description: string
  linkToEventId?: number // Optional link to an event
}

// Contact info type definition
export type ContactInfo = {
  instagram: string
  whatsapp: string
  email: string
}

export type ContactMethod = "phone" | "whatsapp" | "email"

export type CustomerInfo = {
  name: string
  email: string
  phone: string
  contactMethod: ContactMethod
  delivery: boolean
  deliveryAddress: string
  pickupAtEvent?: boolean // Whether to pick up at an event
  eventId?: number // ID of the event for pickup
}

export type Order = {
  id: string
  date: string
  items: CartItem[]
  customer: CustomerInfo
  total: number
  eventId?: number // ID of the event this order is associated with
}
