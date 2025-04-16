"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Calendar, MapPin, AlertTriangle, UserPlus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import type { Product, CartItem, CustomerInfo, ContactMethod, CartAddOn, Event } from "@/types/shop-types"
import { formatDate } from "@/lib/utils"
import { fetchApi, getApiUrl } from "@/utils/api"

export default function Checkout() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [addons, setAddons] = useState<any[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // State for saving customer info
  const [saveInfo, setSaveInfo] = useState(false)
  const [hasStoredInfo, setHasStoredInfo] = useState(false)
  const [useStoredInfo, setUseStoredInfo] = useState(true)

  // Customer information state
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    contactMethod: "phone",
    delivery: false,
    deliveryAddress: "",
    pickupAtEvent: false,
    eventId: undefined,
  })

  // Form validation state
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    deliveryAddress: false,
    eventId: false,
  })

  // Load cart data, events, and saved customer info from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("pastryCart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    const savedProducts = localStorage.getItem("pastryProducts")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    }
    
    const savedAddons = localStorage.getItem("pastryAddons")
    if (savedAddons) {
      setAddons(JSON.parse(savedAddons))
    }

    const savedEvents = localStorage.getItem("pastryEvents")
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents))
    }
    
    // Load saved customer info if available
    const savedCustomerInfo = localStorage.getItem("pastryCustomerInfo")
    if (savedCustomerInfo) {
      try {
        const parsedInfo = JSON.parse(savedCustomerInfo) as CustomerInfo
        setCustomerInfo(parsedInfo)
        setHasStoredInfo(true)
        setUseStoredInfo(true)
      } catch (error) {
        console.error("Error parsing saved customer info:", error)
      }
    }

    setIsLoading(false)
  }, [])

  // Check if cart has event-only items
  const hasEventOnlyItems = cart.some((item) => {
    const product = products.find(p => p.id === item.productId)
    return product?.eventOnly
  })

  // Get unique event IDs from event-only items
  const eventOnlyEventIds = Array.from(
    new Set(
      cart
        .filter((item) => {
          const product = products.find(p => p.id === item.productId)
          return product?.eventOnly
        })
        .map((item) => {
          const product = products.find(p => p.id === item.productId)
          return product?.eventId
        })
        .filter(Boolean) as number[],
    ),
  )

  // Get events for event-only items
  const eventOnlyEvents = events.filter((event) => eventOnlyEventIds.includes(event.id))

  // Set default event ID if there's only one event-only event
  useEffect(() => {
    if (hasEventOnlyItems && eventOnlyEventIds.length === 1 && !customerInfo.eventId) {
      setCustomerInfo((prev) => ({
        ...prev,
        pickupAtEvent: true,
        eventId: eventOnlyEventIds[0],
      }))
    }
  }, [hasEventOnlyItems, eventOnlyEventIds, customerInfo.eventId])

  // Toggle using stored info
  const handleToggleStoredInfo = (useStored: boolean) => {
    setUseStoredInfo(useStored)
    
    if (!useStored) {
      // Reset form to empty values when user chooses not to use stored info
      setCustomerInfo({
        name: "",
        email: "",
        phone: "",
        contactMethod: "phone",
        delivery: false,
        deliveryAddress: "",
        pickupAtEvent: customerInfo.pickupAtEvent, // Keep event pickup setting as it depends on cart contents
        eventId: customerInfo.eventId, // Keep event ID as it depends on cart contents
      })
    } else {
      // Restore saved info from localStorage
      const savedCustomerInfo = localStorage.getItem("pastryCustomerInfo")
      if (savedCustomerInfo) {
        try {
          const parsedInfo = JSON.parse(savedCustomerInfo) as CustomerInfo
          // Keep event-related settings from current state since they're contextual to this order
          setCustomerInfo({
            ...parsedInfo,
            pickupAtEvent: customerInfo.pickupAtEvent,
            eventId: customerInfo.eventId,
          })
        } catch (error) {
          console.error("Error parsing saved customer info:", error)
        }
      }
    }
  }

  // Handle checkbox change for saving customer info
  const handleSaveInfoChange = (checked: boolean) => {
    setSaveInfo(checked)
  }

  // Calculate item price including add-ons
  const calculateItemPrice = (productId: number, cartAddons: CartAddOn[]) => {
    const product = products.find(p => p.id === productId)
    if (!product) return 0
    
    const basePrice = product.price
    const addonsPrice = cartAddons.reduce((sum, cartAddon) => {
      const addon = addons.find(a => a.id === cartAddon.addonId)
      return sum + (addon?.price || 0) * cartAddon.quantity
    }, 0)

    return basePrice + addonsPrice
  }

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => {
    const itemPrice = calculateItemPrice(item.productId, item.addons)
    return sum + itemPrice * item.quantity
  }, 0)

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCustomerInfo((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: false }))
    }
  }

  // Handle checkbox change
  const handleDeliveryChange = (checked: boolean) => {
    // Can't have both delivery and event pickup
    if (checked && customerInfo.pickupAtEvent) {
      setCustomerInfo((prev) => ({
        ...prev,
        delivery: checked,
        pickupAtEvent: false,
        eventId: undefined,
      }))
    } else {
      setCustomerInfo((prev) => ({ ...prev, delivery: checked }))
    }

    if (!checked) {
      setCustomerInfo((prev) => ({ ...prev, deliveryAddress: "" }))
      setErrors((prev) => ({ ...prev, deliveryAddress: false }))
    }
  }

  // Handle event pickup change
  const handleEventPickupChange = (checked: boolean) => {
    // Can't have both delivery and event pickup
    if (checked && customerInfo.delivery) {
      setCustomerInfo((prev) => ({
        ...prev,
        pickupAtEvent: checked,
        delivery: false,
        deliveryAddress: "",
        eventId: eventOnlyEventIds.length === 1 ? eventOnlyEventIds[0] : prev.eventId,
      }))
    } else {
      setCustomerInfo((prev) => ({
        ...prev,
        pickupAtEvent: checked,
        eventId: checked ? (eventOnlyEventIds.length === 1 ? eventOnlyEventIds[0] : prev.eventId) : undefined,
      }))
    }

    if (!checked) {
      setCustomerInfo((prev) => ({ ...prev, eventId: undefined }))
      setErrors((prev) => ({ ...prev, eventId: false }))
    }
  }

  // Handle event selection
  const handleEventChange = (value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      eventId: Number.parseInt(value),
    }))
    setErrors((prev) => ({ ...prev, eventId: false }))
  }

  // Handle contact method change
  const handleContactMethodChange = (value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      contactMethod: value as ContactMethod,
    }))
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !customerInfo.name.trim(),
      email: !customerInfo.email.trim() || !/^\S+@\S+\.\S+$/.test(customerInfo.email),
      phone: !customerInfo.phone.trim(),
      deliveryAddress: customerInfo.delivery && !customerInfo.deliveryAddress.trim(),
      eventId: customerInfo.pickupAtEvent && !customerInfo.eventId ? true : false,
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setIsSubmitting(true)
      setSubmitError(null)
      
      try {
        // Prepare order data for API
        const orderData = {
          items: cart,
          customer: customerInfo,
          eventId: customerInfo.eventId
        }
        
        // Send order to API
        const response = await fetchApi('orders', {
          method: 'POST',
          body: JSON.stringify(orderData)
        })
        
        // Save customer info if checkbox is checked
        if (saveInfo) {
          localStorage.setItem("pastryCustomerInfo", JSON.stringify(customerInfo))
        }
        
        // Clear cart from localStorage
        localStorage.removeItem("pastryCart")
        
        // Show success message
        setOrderSubmitted(true)
      } catch (error) {
        console.error('Error submitting order:', error)
        setSubmitError('Failed to submit order. Please try again or contact us directly.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  // Go back to main page
  const goBack = () => {
    router.push("/")
  }

  // Get selected event
  const selectedEvent = customerInfo.eventId ? events.find((event) => event.id === customerInfo.eventId) : null

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    )
  }

  if (cart.length === 0 && !orderSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
        <p className="mb-4">Your cart is empty</p>
        <Button onClick={goBack}>Return to Shop</Button>
      </div>
    )
  }

  if (orderSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Order Received!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              Thank you for your order. We will contact you shortly via your preferred method (
              {customerInfo.contactMethod}) to confirm your order details
              {customerInfo.delivery ? " and provide delivery cost information" : ""}
              {customerInfo.pickupAtEvent && selectedEvent ? ` for pickup at ${selectedEvent.name}` : ""}.
            </p>
            <Button onClick={goBack} className="w-full">
              Return to Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0" onClick={goBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <Card>
            <CardContent className="p-6">
              {cart.map((item, index) => (
                <div key={index} className="py-3 border-b last:border-0">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {products.find(p => p.id === item.productId)?.name} × {item.quantity}
                        </p>
                        {products.find(p => p.id === item.productId)?.eventOnly && (
                          <Badge variant="outline" className="text-xs">
                            Event Only
                          </Badge>
                        )}
                      </div>
                      {item.notes && <p className="text-sm text-muted-foreground italic">Note: {item.notes}</p>}
                    </div>
                    <p className="font-medium">
                      ${(calculateItemPrice(item.productId, item.addons) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Add-ons display */}
                  {item.addons.length > 0 && (
                    <div className="mt-2 pl-4 border-l-2 border-muted">
                      {item.addons.map((addon, addonIndex) => (
                        <div key={addonIndex} className="flex justify-between text-sm mt-1">
                          <div>
                            <p className="text-sm">
                              {addons.find(a => a.id === addon.addonId)?.name} × {addon.quantity}
                            </p>
                            {addon.notes && <p className="text-xs text-muted-foreground italic">Note: {addon.notes}</p>}
                          </div>
                          <p className="text-sm">${(addons.find(a => a.id === addon.addonId)?.price || 0 * addon.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between pt-4 font-bold">
                <p>Total</p>
                <p>${totalPrice.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Event-only items warning */}
          {hasEventOnlyItems && (
            <div className="mt-4">
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <h3 className="font-medium text-amber-800 mb-2">Event-Only Items in Your Cart</h3>
                  <p className="text-sm text-amber-700">
                    Your order contains items that are only available for pickup at specific events. Please select the
                    event pickup option below.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Customer Information Form */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Information</h2>
          <Card>
            {submitError && (
              <div className="p-4 border-b border-red-200 bg-red-50">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  <p>{submitError}</p>
                </div>
              </div>
            )}
            <CardContent className="p-6">
              {/* Show saved information toggle if there's stored info */}
              {hasStoredInfo && (
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{localStorage.getItem("pastryCustomerInfo") ? JSON.parse(localStorage.getItem("pastryCustomerInfo") || "{}").name : ""}</p>
                        <p className="text-sm text-muted-foreground">{localStorage.getItem("pastryCustomerInfo") ? JSON.parse(localStorage.getItem("pastryCustomerInfo") || "{}").email : ""}</p>
                      </div>
                    </div>
                    <Button 
                      variant={useStoredInfo ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleToggleStoredInfo(true)}
                    >
                      Use This Info
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      <UserPlus className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Use Different Information</p>
                        <p className="text-sm text-muted-foreground">Fill in the form with new details</p>
                      </div>
                    </div>
                    <Button 
                      variant={!useStoredInfo ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => handleToggleStoredInfo(false)}
                    >
                      Use New Info
                    </Button>
                  </div>
                  
                  <Separator />
                </div>
              )}
            
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleInputChange}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">Name is required</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={handleInputChange}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">Valid email is required</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={customerInfo.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">Phone number is required</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="saveInfo" 
                    checked={saveInfo} 
                    onCheckedChange={handleSaveInfoChange}
                  />
                  <Label htmlFor="saveInfo" className="text-sm text-muted-foreground">
                    Save my information for faster checkout next time
                  </Label>
                </div>

                <Separator className="my-4" />

                <div>
                  <Label className="mb-2 block">Preferred Contact Method *</Label>
                  <RadioGroup
                    value={customerInfo.contactMethod}
                    onValueChange={handleContactMethodChange}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="phone" id="phone-call" />
                      <Label htmlFor="phone-call">Phone Call</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp">WhatsApp (text/call)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email-contact" />
                      <Label htmlFor="email-contact">Email</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <h3 className="font-medium">Pickup or Delivery Options</h3>

                  {/* Event Pickup Option */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eventPickup"
                        checked={customerInfo.pickupAtEvent}
                        onCheckedChange={handleEventPickupChange}
                        disabled={hasEventOnlyItems} // Disable toggling if there are event-only items
                      />
                      <Label htmlFor="eventPickup" className={hasEventOnlyItems ? "font-medium" : ""}>
                        Pickup at Event
                        {hasEventOnlyItems && " (Required for event-only items)"}
                      </Label>
                    </div>

                    {customerInfo.pickupAtEvent && (
                      <div className="pl-6 mt-2 space-y-3">
                        <div>
                          <Label htmlFor="eventId">Select Event *</Label>
                          <RadioGroup
                            value={customerInfo.eventId?.toString() || ""}
                            onValueChange={handleEventChange}
                            className="mt-2 space-y-2"
                          >
                            {eventOnlyEvents.map((event) => (
                              <div key={event.id} className="flex items-start space-x-2 border p-3 rounded-md">
                                <RadioGroupItem value={event.id.toString()} id={`event-${event.id}`} className="mt-1" />
                                <div>
                                  <Label htmlFor={`event-${event.id}`} className="font-medium">
                                    {event.name}
                                  </Label>
                                  <div className="text-sm text-muted-foreground mt-1 flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    <span>
                                      {event.endDate
                                        ? `${formatDate(event.date)} - ${formatDate(event.endDate)}`
                                        : formatDate(event.date)}
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{event.location}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                          {errors.eventId && <p className="text-red-500 text-sm mt-1">Please select an event</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Delivery Option - Disabled if there are event-only items */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delivery"
                        checked={customerInfo.delivery}
                        onCheckedChange={handleDeliveryChange}
                        disabled={hasEventOnlyItems} // Disable if there are event-only items
                      />
                      <Label htmlFor="delivery">
                        I would like delivery
                        {hasEventOnlyItems && " (Not available for event-only items)"}
                      </Label>
                    </div>

                    {customerInfo.delivery && (
                      <div className="pl-6 mt-2">
                        <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                        <Textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          value={customerInfo.deliveryAddress}
                          onChange={handleInputChange}
                          className={errors.deliveryAddress ? "border-red-500" : ""}
                        />
                        {errors.deliveryAddress && (
                          <p className="text-red-500 text-sm mt-1">Delivery address is required</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          Delivery cost will be disclosed when we contact you.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Submit Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
