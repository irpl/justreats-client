"use client"

import { Heart, ShoppingBag } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { AddOn, CartItem, Product } from "@/types/shop-types"
import { cn } from "@/lib/utils"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  products: Product[]
  addons: AddOn[]
  onRemove: (index: number) => void
  onCheckout: () => void
}

export function CartSheet({ open, onOpenChange, cart, products, addons, onRemove, onCheckout }: CartSheetProps) {
  const calculateItemPrice = (productId: number, cartAddons: CartItem["addons"]) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return 0
    const addonsPrice = cartAddons.reduce((sum, ca) => {
      const a = addons.find((x) => x.id === ca.addonId)
      return sum + (a?.price || 0) * ca.quantity
    }, 0)
    return product.price + addonsPrice
  }

  const totalPrice = cart.reduce(
    (sum, item) => sum + calculateItemPrice(item.productId, item.addons) * item.quantity,
    0,
  )

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md bg-brand-blush border-l-[3px] border-brand-pink/40 overflow-y-auto">
        <SheetHeader className="text-center">
          <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-pink text-white shadow-md">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <SheetTitle className="font-display font-extrabold uppercase tracking-wide text-2xl text-brand-pink">
            Your Order
          </SheetTitle>
          <SheetDescription className="font-script text-lg text-brand-purple">
            {cart.length === 0 ? "Add some sweet treats" : `${totalQty} item${totalQty !== 1 ? "s" : ""} ready to go`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {cart.length === 0 ? (
            <div className="rounded-2xl border-[2px] border-dashed border-brand-pink/40 bg-white p-8 text-center">
              <Heart className="mx-auto h-8 w-8 fill-brand-pink-soft text-brand-pink-soft" />
              <p className="mt-3 font-display font-bold uppercase tracking-wider text-sm text-brand-ink/60">
                Your cart is empty
              </p>
            </div>
          ) : (
            <>
              {cart.map((item, index) => {
                const product = products.find((p) => p.id === item.productId)
                if (!product) return null
                const linePrice = calculateItemPrice(item.productId, item.addons) * item.quantity

                return (
                  <div
                    key={index}
                    className="rounded-2xl border-[2px] border-dashed border-brand-pink/40 bg-white p-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover bg-brand-blush"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display font-extrabold uppercase tracking-wide text-sm text-brand-ink leading-tight">
                          {product.name}
                        </h4>
                        <p className="text-xs text-brand-ink/60 mt-0.5">Qty: {item.quantity}</p>
                        {item.notes && (
                          <p className="text-xs italic text-brand-purple mt-0.5 line-clamp-2">"{item.notes}"</p>
                        )}
                        {product.eventOnly && (
                          <span className="mt-1 inline-flex rounded-full bg-brand-purple-soft px-2 py-0.5 text-[10px] font-display font-bold uppercase tracking-wider text-brand-purple">
                            Event Pickup
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-display font-extrabold text-brand-pink">${linePrice.toFixed(2)}</p>
                        <button
                          onClick={() => onRemove(index)}
                          className="mt-1 text-[10px] uppercase tracking-wider text-brand-ink/50 hover:text-brand-pink"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {item.addons.length > 0 && (
                      <div className="mt-2 ml-19 space-y-1 border-l-2 border-brand-pink-soft pl-3">
                        {item.addons.map((ca, ai) => {
                          const a = addons.find((x) => x.id === ca.addonId)
                          if (!a) return null
                          return (
                            <div key={ai} className="flex justify-between text-xs text-brand-ink/70">
                              <span className="truncate">
                                + {a.name} (×{ca.quantity})
                              </span>
                              <span>${(a.price * ca.quantity).toFixed(2)}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="rounded-2xl bg-brand-purple p-4 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold uppercase tracking-wider text-sm">Total</span>
                  <span className="font-display font-extrabold text-2xl">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={onCheckout}
                disabled={cart.length === 0}
                className={cn(
                  "w-full rounded-full bg-brand-pink text-white shadow-md hover:bg-brand-pink/90",
                  "font-display font-extrabold uppercase tracking-wider text-sm py-6",
                )}
              >
                <Heart className="h-4 w-4 fill-white text-white" />
                Proceed to Checkout
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
