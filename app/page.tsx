"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Instagram,
  Mail,
  ShoppingBag,
  PhoneIcon as WhatsApp,
  X,
  Calendar,
  Filter,
  MapPin,
  File,
  Heart,
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { EventBanner } from "@/components/event-banner"
import { FlyerHero } from "@/components/flyer-hero"
import { FlyerPickupCard } from "@/components/flyer-pickup-card"
import { FlyerProductCard } from "@/components/flyer-product-card"
import { OrderingDrawer } from "@/components/ordering-drawer"
import { CartSheet } from "@/components/cart-sheet"
import { DashedFrame, HeartDecor, Ribbon, SparkleDecor } from "@/components/flyer-decor"
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { fetchApi, getProducts } from "@/utils/api"
import {
  defaultAddons,
  defaultBanner,
  defaultContactInfo,
  defaultEvents,
  defaultProducts,
  formatLongDate,
} from "@/app/_home-data"
import type {
  AddOn,
  Banner,
  CartItem,
  ContactInfo,
  Event,
  Product,
  SelectedAddOn,
} from "@/types/shop-types"
import { cn } from "@/lib/utils"

export default function Home() {
  const router = useRouter()
  const [banner, setBanner] = useState<Banner>({} as Banner)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo)
  const [isLoading, setIsLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [hasOrders, setHasOrders] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null)
  const [showEventsSheet, setShowEventsSheet] = useState(false)
  const [showCart, setShowCart] = useState(false)
  const [orderingProduct, setOrderingProduct] = useState<Product | null>(null)

  const {
    items: products,
    loading: loadingProducts,
    loaderRef: productsLoaderRef,
    hasMore: hasMoreProducts,
  } = useInfiniteScroll<Product>({
    pageSize: 6,
    fetchFunction: async (page, size) => {
      try {
        return await getProducts(false, { page, size })
      } catch (error) {
        console.error("Error fetching products:", error)
        let stored = JSON.parse(localStorage.getItem("pastryProducts") || "[]")
        if (stored.length === 0) {
          stored = defaultProducts
          localStorage.setItem("pastryProducts", JSON.stringify(defaultProducts))
        }
        const start = (page - 1) * size
        return stored.slice(start, start + size)
      }
    },
    enabled: !isLoading,
  })

  const {
    items: events,
    loading: loadingEvents,
    loaderRef: eventsLoaderRef,
    hasMore: hasMoreEvents,
  } = useInfiniteScroll<Event>({
    pageSize: 3,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<Event[]>(`events?page=${page}&size=${size}`)
      } catch (error) {
        console.error("Error fetching events:", error)
        let stored = JSON.parse(localStorage.getItem("pastryEvents") || "[]")
        if (stored.length === 0) {
          stored = defaultEvents
          localStorage.setItem("pastryEvents", JSON.stringify(defaultEvents))
        }
        const start = (page - 1) * size
        return stored.slice(start, start + size)
      }
    },
    enabled: !isLoading,
  })

  const { items: addons } = useInfiniteScroll<AddOn>({
    pageSize: 6,
    fetchFunction: async (page, size) => {
      try {
        return await fetchApi<AddOn[]>(`addons?page=${page}&size=${size}`)
      } catch (error) {
        console.error("Error fetching add-ons:", error)
        let stored = JSON.parse(localStorage.getItem("pastryAddons") || "[]")
        if (stored.length === 0) {
          stored = defaultAddons
          localStorage.setItem("pastryAddons", JSON.stringify(defaultAddons))
        }
        const start = (page - 1) * size
        return stored.slice(start, start + size)
      }
    },
    enabled: !isLoading,
  })

  // Initial load: cart + banner + contact + orders flag
  useEffect(() => {
    const savedOrders = localStorage.getItem("pastryOrders")
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders)
        setHasOrders(Array.isArray(parsed) && parsed.length > 0)
      } catch {}
    }

    const savedCart = localStorage.getItem("pastryCart")
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        const converted = parsed.map((item: any) =>
          item.productId
            ? item
            : {
                productId: item.product.id,
                quantity: item.quantity,
                notes: item.notes,
                addons: item.addons.map((a: any) => ({
                  addonId: a.addon.id,
                  quantity: a.quantity,
                  notes: a.notes,
                })),
              },
        )
        setCart(converted)
      } catch (e) {
        console.error("Error parsing cart:", e)
      }
    }

    fetchApi<Banner>("banner")
      .then(setBanner)
      .catch(() => {
        const saved = localStorage.getItem("pastryBanner")
        if (saved) setBanner(JSON.parse(saved))
        else {
          localStorage.setItem("pastryBanner", JSON.stringify(defaultBanner))
          setBanner(defaultBanner)
        }
      })

    fetchApi<ContactInfo>("contact")
      .then(setContactInfo)
      .catch(() => {
        const saved = localStorage.getItem("pastryContactInfo")
        if (saved) setContactInfo(JSON.parse(saved))
        else localStorage.setItem("pastryContactInfo", JSON.stringify(defaultContactInfo))
      })

    setIsLoading(false)
  }, [])

  const addToCart = (
    product: Product,
    data: { quantity: number; notes: string; addons: SelectedAddOn[] },
  ) => {
    if (data.quantity <= 0) return

    const newItem: CartItem = {
      productId: product.id,
      quantity: data.quantity,
      notes: data.notes,
      addons: data.addons.map((sa) => ({
        addonId: sa.addon.id,
        quantity: sa.quantity,
        notes: sa.notes,
      })),
    }

    const existingIndex = cart.findIndex((item) => item.productId === product.id)
    const updated =
      existingIndex >= 0
        ? cart.map((item, i) => (i === existingIndex ? newItem : item))
        : [...cart, newItem]

    setCart(updated)
    localStorage.setItem("pastryCart", JSON.stringify(updated))

    // Persist any new product/addons so they survive a refresh in the cart view
    const savedProducts = JSON.parse(localStorage.getItem("pastryProducts") || "[]")
    if (!savedProducts.some((p: Product) => p.id === product.id)) {
      savedProducts.push(product)
      localStorage.setItem("pastryProducts", JSON.stringify(savedProducts))
    }
    if (data.addons.length > 0) {
      const savedAddons = JSON.parse(localStorage.getItem("pastryAddons") || "[]")
      let dirty = false
      data.addons.forEach((sa) => {
        if (!savedAddons.some((a: AddOn) => a.id === sa.addon.id)) {
          savedAddons.push(sa.addon)
          dirty = true
        }
      })
      if (dirty) localStorage.setItem("pastryAddons", JSON.stringify(savedAddons))
    }
  }

  const removeFromCart = (index: number) => {
    const updated = cart.filter((_, i) => i !== index)
    setCart(updated)
    localStorage.setItem("pastryCart", JSON.stringify(updated))
  }

  const formatWhatsAppLink = (number: string) =>
    `https://wa.me/${number.replace(/\D/g, "")}`

  const getApplicableAddons = (product: Product): AddOn[] => {
    if (!product.applicableAddons) return []
    return addons.filter(
      (a) => product.applicableAddons?.includes(a.id) && a.available !== false,
    )
  }

  const handleSelectEvent = (eventId: number) => {
    setSelectedEventId(eventId === selectedEventId ? null : eventId)
    setShowEventsSheet(false)
  }

  const filteredProducts = selectedEventId
    ? products.filter((p) => p.eventOnly && p.eventId === selectedEventId)
    : products.filter((p) => !p.eventOnly)

  const selectedEvent = selectedEventId
    ? events.find((e) => e.id === selectedEventId)
    : null
  const featuredEvents = events.filter((e) => e.featured)

  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0)

  const orderingCartItem = orderingProduct
    ? cart.find((item) => item.productId === orderingProduct.id)
    : undefined
  const orderingInitialAddons: SelectedAddOn[] | undefined = orderingCartItem
    ? (orderingCartItem.addons
        .map((ca) => {
          const a = addons.find((x) => x.id === ca.addonId)
          return a ? { addon: a, quantity: ca.quantity, notes: ca.notes } : null
        })
        .filter(Boolean) as SelectedAddOn[])
    : undefined

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-blush">
        <p className="font-script text-3xl text-brand-pink">Loading sweetness…</p>
      </div>
    )
  }

  const RoundIconButton = ({
    onClick,
    children,
    label,
    badge,
    variant = "white",
  }: {
    onClick: () => void
    children: React.ReactNode
    label: string
    badge?: number
    variant?: "white" | "pink"
  }) => (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 shadow-md transition-colors",
        variant === "white"
          ? "bg-white text-brand-pink border-brand-pink/40 hover:bg-brand-pink hover:text-white"
          : "bg-brand-pink text-white border-white hover:bg-brand-purple hover:border-white",
      )}
    >
      {children}
      {typeof badge === "number" && badge > 0 && (
        <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-purple px-1 text-[10px] font-display font-bold text-white border-2 border-white">
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <main className="relative min-h-screen bg-brand-blush brand-dot-bg">
      {/* Floating top action bar */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-30 flex gap-2">
        {hasOrders && (
          <RoundIconButton onClick={() => router.push("/orders")} label="Orders">
            <File className="h-5 w-5" />
          </RoundIconButton>
        )}
        <RoundIconButton
          onClick={() => setShowEventsSheet(true)}
          label="Events"
          badge={selectedEventId ? 1 : undefined}
        >
          <Calendar className="h-5 w-5" />
        </RoundIconButton>
        <RoundIconButton
          onClick={() => setShowCart(true)}
          label="Cart"
          badge={cartTotalQty}
          variant="pink"
        >
          <ShoppingBag className="h-5 w-5" />
        </RoundIconButton>
      </div>

      <div className="container mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8">
        {/* Outer dashed frame */}
        <div className="relative overflow-hidden rounded-[32px] border-[4px] border-dashed border-brand-pink/50 bg-white/40 p-4 sm:p-8 shadow-sm">
          <SparkleDecor className="absolute left-4 top-1/3 h-4 w-4 opacity-60" rotate={20} />
          <SparkleDecor className="absolute right-6 top-2/3 h-3 w-3 opacity-60" rotate={-15} />
          <HeartDecor variant="mint" className="absolute -right-4 bottom-24 h-12 w-12 opacity-60" rotate={20} />
          <HeartDecor variant="pink" className="absolute -left-4 bottom-40 h-10 w-10 opacity-60" rotate={-15} />

          <FlyerHero />

          {/* Selected event header */}
          {selectedEvent && (
            <DashedFrame variant="purple" className="mt-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold uppercase tracking-[0.18em] text-[10px] sm:text-xs text-brand-purple">
                    Now showing items from
                  </p>
                  <h3 className="font-display font-extrabold uppercase tracking-wide text-lg sm:text-xl text-brand-purple mt-1 truncate">
                    {selectedEvent.name}
                  </h3>
                  <p className="font-script text-base sm:text-lg text-brand-pink">
                    {formatLongDate(selectedEvent.date)}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[10px] sm:text-xs uppercase tracking-wider text-brand-ink/70">
                    <MapPin className="h-3 w-3" /> {selectedEvent.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEventId(null)}
                  aria-label="Show all products"
                  className="shrink-0 rounded-full bg-brand-pink-soft p-2 text-brand-pink transition-colors hover:bg-brand-pink hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DashedFrame>
          )}

          {/* Pickup info card (only when no event is selected) */}
          {!selectedEvent && banner?.enabled && banner?.title && (
            <div className="mt-6">
              <FlyerPickupCard
                heading="Pickup is from"
                location={banner.title}
                date={banner.description}
                onClick={
                  banner.linkToEventId
                    ? () => setSelectedEventId(banner.linkToEventId!)
                    : undefined
                }
              />
            </div>
          )}

          {/* Featured events */}
          {!selectedEventId && featuredEvents.length > 0 && (
            <section className="mt-8">
              <div className="flex justify-center">
                <Ribbon variant="purple" className="text-xs">
                  Upcoming Events
                </Ribbon>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredEvents.map((event) => (
                  <EventBanner
                    key={event.id}
                    event={event}
                    onSelectEvent={handleSelectEvent}
                    isSelected={false}
                  />
                ))}
                {hasMoreEvents && (
                  <div ref={eventsLoaderRef} className="col-span-full py-4 flex justify-center">
                    {loadingEvents && (
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-pink" />
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Products section */}
          <section className="mt-10">
            <div className="flex justify-center">
              <Ribbon variant={selectedEventId ? "purple" : "pink"}>
                {selectedEventId ? "Event-Only Treats" : "Our Treats"}
              </Ribbon>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mt-6 rounded-2xl border-[2px] border-dashed border-brand-pink/40 bg-white p-10 text-center">
                <Heart className="mx-auto h-8 w-8 fill-brand-pink-soft text-brand-pink-soft" />
                <p className="mt-3 font-display font-bold uppercase tracking-wider text-sm text-brand-ink/60">
                  {selectedEventId
                    ? "No items available for this event yet"
                    : "No treats available right now"}
                </p>
                {selectedEventId && (
                  <Button
                    variant="outline"
                    className="mt-4 rounded-full border-brand-pink/50 text-brand-pink hover:bg-brand-pink-soft"
                    onClick={() => setSelectedEventId(null)}
                  >
                    Show all treats
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredProducts.map((product, idx) => {
                  const cartItem = cart.find((item) => item.productId === product.id)
                  return (
                    <FlyerProductCard
                      key={product.id}
                      product={product}
                      index={idx}
                      cartQuantity={cartItem?.quantity ?? 0}
                      onSelect={setOrderingProduct}
                    />
                  )
                })}
                {!selectedEventId && hasMoreProducts && (
                  <div ref={productsLoaderRef} className="col-span-full py-4 flex justify-center">
                    {loadingProducts && (
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-brand-pink" />
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="inline-flex items-center justify-center gap-2 font-display font-bold uppercase tracking-[0.18em] text-xs sm:text-sm text-brand-pink">
              <Heart className="h-3 w-3 fill-brand-pink text-brand-pink" />
              <span>Thank you for supporting homemade</span>
              <Heart className="h-3 w-3 fill-brand-pink text-brand-pink" />
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href={`https://instagram.com/${contactInfo.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram @${contactInfo.instagram}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-pink border-2 border-brand-pink/40 shadow-sm transition-colors hover:bg-brand-pink hover:text-white"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href={formatWhatsAppLink(contactInfo.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${contactInfo.whatsapp}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-purple border-2 border-brand-purple/40 shadow-sm transition-colors hover:bg-brand-purple hover:text-white"
              >
                <WhatsApp className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                aria-label={`Email ${contactInfo.email}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-pink border-2 border-brand-pink/40 shadow-sm transition-colors hover:bg-brand-pink hover:text-white"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sheet */}
      <CartSheet
        open={showCart}
        onOpenChange={setShowCart}
        cart={cart}
        products={products}
        addons={addons}
        onRemove={removeFromCart}
        onCheckout={() => {
          setShowCart(false)
          router.push("/checkout")
        }}
      />

      {/* Events Sheet */}
      <Sheet open={showEventsSheet} onOpenChange={setShowEventsSheet}>
        <SheetContent className="w-full sm:max-w-md bg-brand-blush border-l-[3px] border-brand-pink/40 overflow-y-auto">
          <SheetHeader className="text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-purple text-white shadow-md">
              <Calendar className="h-5 w-5" />
            </div>
            <SheetTitle className="font-display font-extrabold uppercase tracking-wide text-2xl text-brand-purple">
              Upcoming Events
            </SheetTitle>
            <SheetDescription className="font-script text-lg text-brand-pink">
              Browse our pop-ups and specials
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {events.length === 0 ? (
              <div className="rounded-2xl border-[2px] border-dashed border-brand-purple/40 bg-white p-6 text-center">
                <p className="font-display font-bold uppercase tracking-wider text-sm text-brand-ink/60">
                  No upcoming events
                </p>
              </div>
            ) : (
              <>
                {selectedEventId && (
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-brand-pink/50 text-brand-pink hover:bg-brand-pink-soft"
                    onClick={() => {
                      setSelectedEventId(null)
                      setShowEventsSheet(false)
                    }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Show all treats
                  </Button>
                )}
                {events.map((event) => (
                  <EventBanner
                    key={event.id}
                    event={event}
                    onSelectEvent={handleSelectEvent}
                    isSelected={selectedEventId === event.id}
                  />
                ))}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Per-product ordering drawer */}
      <OrderingDrawer
        product={orderingProduct}
        open={orderingProduct !== null}
        onOpenChange={(open) => {
          if (!open) setOrderingProduct(null)
        }}
        applicableAddons={
          orderingProduct ? getApplicableAddons(orderingProduct) : []
        }
        initialQuantity={orderingCartItem?.quantity}
        initialNotes={orderingCartItem?.notes}
        initialAddons={orderingInitialAddons}
        onSubmit={(data) => {
          if (orderingProduct) addToCart(orderingProduct, data)
        }}
      />
    </main>
  )
}
