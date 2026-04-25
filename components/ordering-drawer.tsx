"use client"

import { useEffect, useState } from "react"
import { MinusCircle, PlusCircle, Plus, X, Heart } from "lucide-react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { AddOn, Product, SelectedAddOn } from "@/types/shop-types"

interface OrderingDrawerProps {
  product: Product | null
  applicableAddons: AddOn[]
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuantity?: number
  initialNotes?: string
  initialAddons?: SelectedAddOn[]
  onSubmit: (data: { quantity: number; notes: string; addons: SelectedAddOn[] }) => void
}

export function OrderingDrawer({
  product,
  applicableAddons,
  open,
  onOpenChange,
  initialQuantity,
  initialNotes,
  initialAddons,
  onSubmit,
}: OrderingDrawerProps) {
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [selected, setSelected] = useState<SelectedAddOn[]>([])

  useEffect(() => {
    if (open && product) {
      setQuantity(initialQuantity && initialQuantity > 0 ? initialQuantity : 1)
      setNotes(initialNotes ?? "")
      setSelected(initialAddons ?? [])
    }
  }, [open, product?.id, initialQuantity, initialNotes, initialAddons])

  if (!product) return null

  const addonsTotal = selected.reduce((sum, sa) => sum + sa.addon.price * sa.quantity, 0)
  const lineTotal = (product.price + addonsTotal) * quantity

  const addAddon = (addon: AddOn) => {
    setSelected((prev) =>
      prev.some((sa) => sa.addon.id === addon.id)
        ? prev
        : [...prev, { addon, quantity: 1, notes: "" }],
    )
  }

  const removeAddon = (addonId: number) => {
    setSelected((prev) => prev.filter((sa) => sa.addon.id !== addonId))
  }

  const updateAddonQty = (addonId: number, delta: number) => {
    setSelected((prev) =>
      prev.map((sa) =>
        sa.addon.id === addonId ? { ...sa, quantity: Math.max(1, sa.quantity + delta) } : sa,
      ),
    )
  }

  const updateAddonNotes = (addonId: number, text: string) => {
    setSelected((prev) =>
      prev.map((sa) => (sa.addon.id === addonId ? { ...sa, notes: text } : sa)),
    )
  }

  const handleSubmit = () => {
    if (quantity <= 0) return
    onSubmit({ quantity, notes, addons: selected })
    onOpenChange(false)
  }

  const availableAddons = applicableAddons.filter(
    (a) => !selected.some((sa) => sa.addon.id === a.id),
  )

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-brand-blush border-t-[3px] border-brand-pink/40 max-h-[92vh]">
        <div className="mx-auto w-full max-w-2xl overflow-y-auto px-4 pb-6">
          <DrawerHeader className="text-center px-0">
            <DrawerTitle className="font-display font-extrabold uppercase tracking-wide text-2xl text-brand-pink">
              {product.name}
            </DrawerTitle>
            <DrawerDescription className="font-script text-lg text-brand-purple">
              Customize your order
            </DrawerDescription>
          </DrawerHeader>

          {/* Product preview */}
          <div className="rounded-3xl border-[3px] border-dashed border-brand-pink/50 bg-white p-3">
            <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-blush">
              <img src={product.image || "/placeholder.svg"} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {product.description && (
              <p className="mt-3 px-1 text-center text-xs uppercase tracking-wider text-brand-ink/70">
                {product.description}
              </p>
            )}
            {product.eventOnly && (
              <div className="mt-3 rounded-xl bg-brand-purple-soft p-2 text-center">
                <p className="text-xs font-display font-bold uppercase tracking-wider text-brand-purple">
                  Event pickup only
                </p>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="mt-5 rounded-2xl border-[2px] border-dashed border-brand-pink/50 bg-white p-4">
            <Label className="font-display font-bold uppercase tracking-wider text-xs text-brand-pink">
              Quantity
            </Label>
            <div className="mt-2 flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full border-brand-pink/50 text-brand-pink hover:bg-brand-pink-soft"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                className="w-16 text-center font-display font-bold text-lg"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full border-brand-pink/50 text-brand-pink hover:bg-brand-pink-soft"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 rounded-2xl border-[2px] border-dashed border-brand-purple/50 bg-white p-4">
            <Label className="font-display font-bold uppercase tracking-wider text-xs text-brand-purple">
              Special Instructions
            </Label>
            <Textarea
              placeholder="Any special requests?"
              className="mt-2 resize-none border-brand-purple/30 focus-visible:ring-brand-purple"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Add-ons */}
          {applicableAddons.length > 0 && (
            <div className="mt-4 rounded-2xl border-[2px] border-dashed border-brand-pink/50 bg-white p-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="addons" className="border-none">
                  <AccordionTrigger className="font-display font-bold uppercase tracking-wider text-xs text-brand-pink py-2">
                    Customize with Add-ons
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      {selected.length > 0 && (
                        <div className="space-y-2">
                          {selected.map((sa) => (
                            <div
                              key={sa.addon.id}
                              className="relative rounded-xl bg-brand-blush p-3"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 h-6 w-6 text-brand-pink"
                                onClick={() => removeAddon(sa.addon.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <div className="pr-6">
                                <p className="font-display font-bold text-sm uppercase tracking-wide text-brand-ink">
                                  {sa.addon.name}
                                </p>
                                <p className="text-xs text-brand-ink/60">
                                  ${sa.addon.price.toFixed(2)} each — line ${(sa.addon.price * sa.quantity).toFixed(2)}
                                </p>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Label className="text-xs">Qty:</Label>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => updateAddonQty(sa.addon.id, -1)}
                                  disabled={sa.quantity <= 1}
                                >
                                  <MinusCircle className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-bold w-6 text-center">{sa.quantity}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 rounded-full"
                                  onClick={() => updateAddonQty(sa.addon.id, 1)}
                                >
                                  <PlusCircle className="h-3 w-3" />
                                </Button>
                              </div>
                              <Textarea
                                placeholder={`Notes for ${sa.addon.name}`}
                                className="mt-2 min-h-[50px] resize-none text-sm"
                                value={sa.notes}
                                onChange={(e) => updateAddonNotes(sa.addon.id, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {availableAddons.length > 0 && (
                        <div className="space-y-2">
                          {availableAddons.map((addon) => (
                            <div
                              key={addon.id}
                              className="flex items-center justify-between rounded-xl border border-brand-pink/30 p-2 hover:bg-brand-pink-soft/40"
                            >
                              <div className="min-w-0">
                                <p className="font-display font-bold text-sm uppercase tracking-wide text-brand-ink truncate">
                                  {addon.name}
                                </p>
                                <p className="text-xs text-brand-ink/60 truncate">{addon.description}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                <span className="text-sm font-bold text-brand-pink">${addon.price.toFixed(2)}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full border-brand-pink/50 text-brand-pink"
                                  onClick={() => addAddon(addon)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={quantity <= 0}
            className={cn(
              "mt-5 w-full rounded-full bg-brand-pink text-white shadow-md hover:bg-brand-pink/90",
              "font-display font-extrabold uppercase tracking-wider text-sm py-6",
            )}
          >
            <Heart className="h-4 w-4 fill-white text-white" />
            Add to Order — ${lineTotal.toFixed(2)}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
