"use client";

import React, { type ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Check, Calendar, MapPin, AlertTriangle, UserPlus, User, X, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product, CartItem, CustomerInfo, ContactMethod, CartAddOn, Event } from "@/types/shop-types";
import { formatDate } from "@/lib/utils";
import { fetchApi, getApiUrl } from "@/utils/api";

export default function EditOrder() {
  const router = useRouter();
  const params = useParams<{ unique_order_id: string }>();
  const uniqueOrderId = params.unique_order_id;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderUpdated, setOrderUpdated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasOrders, setHasOrders] = useState(false);

  // State for saving customer info
  const [saveInfo, setSaveInfo] = useState(false);
  const [hasStoredInfo, setHasStoredInfo] = useState(false);
  const [useStoredInfo, setUseStoredInfo] = useState(true);

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
  });

  // Form validation state
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phone: false,
    deliveryAddress: false,
    eventId: false,
  });

  // --- State for Add Item Modal ---
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalNotes, setModalNotes] = useState("");
  const [modalSelectedAddons, setModalSelectedAddons] = useState<CartAddOn[]>([]);
  // --- End State for Add Item Modal ---

  // Load cart data, events, and saved customer info from localStorage on component mount
  useEffect(() => {
    console.log("EditOrder useEffect triggered.");

    const loadOrderData = async () => {
      console.log("Unique Order ID from params hook:", uniqueOrderId);

      let initialCart: CartItem[] = []; // Define initialCart here

      if (uniqueOrderId) {
        try {
          const orderData = await fetchApi<{ items: CartItem[]; customer: CustomerInfo; eventId: number }>(
            `orders/unique/${uniqueOrderId}`
          );
          initialCart = orderData.items; // Assign fetched items
          setCart(orderData.items);
          console.log("Order Data from server:", orderData);
          setCustomerInfo(orderData.customer);
        } catch (error) {
          console.error("Error fetching order data:", error);
          setSubmitError("Failed to load order data. Please try again or contact us directly.");
          return;
        }
      } else {
        setSubmitError("No order ID provided in params.");
        console.log("No uniqueOrderId found in params.");
        return;
      }

      let loadedProducts: Product[] = []; // Define loadedProducts
      let loadedAddons: any[] = []; // Define loadedAddons

      const savedProducts = localStorage.getItem("pastryProducts");
      if (savedProducts) {
        try {
          loadedProducts = JSON.parse(savedProducts); // Assign parsed products
          setProducts(loadedProducts);
        } catch (error) {
          console.error("Error parsing products:", error);
        }
      }

      const savedAddons = localStorage.getItem("pastryAddons");
      if (savedAddons) {
        try {
          loadedAddons = JSON.parse(savedAddons); // Assign parsed addons
          setAddons(loadedAddons);
        } catch (error) {
          console.error("Error parsing addons:", error);
        }
      }

      const savedEvents = localStorage.getItem("pastryEvents");
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents));
        } catch (error) {
          console.error("Error parsing events:", error);
        }
      }

      // Check for existing orders
      const savedOrders = localStorage.getItem('pastryOrders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setHasOrders(Array.isArray(parsedOrders) && parsedOrders.length > 0);
      }

      // Load saved customer info if available
      const savedCustomerInfo = localStorage.getItem("pastryCustomerInfo");
      if (savedCustomerInfo) {
        try {
          const parsedInfo = JSON.parse(savedCustomerInfo) as CustomerInfo;
          // Don't overwrite initially fetched customer info if using stored info is false initially
          if (useStoredInfo) {
             setCustomerInfo(parsedInfo);
          }
          setHasStoredInfo(true);
          // setUseStoredInfo(true); // Don't force true here, respect initial state
        } catch (error) {
          console.error("Error parsing saved customer info:", error);
        }
      }

      // Verify that all needed products and addons for the cart are available
      // Use the loaded data directly instead of relying on potentially stale state
      if (loadedProducts.length > 0 && loadedAddons.length > 0 && initialCart.length > 0) {
        try {
          // Check if any product in cart is missing from products list
          const missingProducts = initialCart.filter((item) => !loadedProducts.some((p) => p.id === item.productId));

          if (missingProducts.length > 0) {
            console.error("Some products in cart are missing from product list:", missingProducts);
            // Remove problematic items from cart
            const filteredCart = initialCart.filter((item) => loadedProducts.some((p) => p.id === item.productId));
            setCart(filteredCart); // Update cart state directly
            initialCart = filteredCart; // Update local variable too
          }

          // Check for missing addons
          let hasInvalidAddons = false;
          const validatedCart = initialCart.map(item => {
             const validAddons = item.addons.filter((addon) => loadedAddons.some((a) => a.addonId === addon.addonId));
             if (validAddons.length !== item.addons.length) {
                 hasInvalidAddons = true;
                 return { ...item, addons: validAddons }; // Return updated item
             }
             return item; // Return original item
          });


          if (hasInvalidAddons) {
            setCart(validatedCart); // Update cart state with validated items
          }
        } catch (error) {
          console.error("Error validating cart data:", error);
        }
      }

      setIsLoading(false);
    };

    loadOrderData();
    // Add useStoredInfo to dependency array if customerInfo setting depends on it
  }, [uniqueOrderId, useStoredInfo]);

  // Check if cart has event-only items
  const hasEventOnlyItems = cart.some((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product?.eventOnly;
  });

  // Filter available products for the modal (exclude event-only if needed, etc.)
  // For now, just show all products. We can refine this.
  const availableProductsForModal = products;

  // --- Handlers for Add Item Modal ---

  const handleOpenAddItemModal = () => {
    setSelectedProductForModal(null);
    setModalQuantity(1);
    setModalNotes("");
    setModalSelectedAddons([]);
    setIsAddItemModalOpen(true);
  };

  const handleSelectProductForModal = (product: Product) => {
    setSelectedProductForModal(product);
    // Reset specific config for the new product
    setModalQuantity(1);
    setModalNotes("");
    setModalSelectedAddons([]);
    // Logic to pre-select required addons could go here
  };

  // Placeholder for handling addon selection within the modal
  const handleModalAddonChange = (addonId: number, checked: boolean, quantity: number = 1) => {
    setModalSelectedAddons(prev => {
        if (checked) {
            // Add or update addon
            const existing = prev.find(a => a.addonId === addonId);
            if (existing) {
                // If addon exists, update its quantity (if applicable, otherwise just ensure it's present)
                // For simplicity, let's assume addon quantity isn't directly editable here yet
                return prev.map(a => a.addonId === addonId ? { ...a, quantity: quantity } : a);
            } else {
                // Add new addon
                return [...prev, { addonId, quantity, notes: '' }]; // Add basic addon structure
            }
        } else {
            // Remove addon
            return prev.filter(a => a.addonId !== addonId);
        }
    });
  };

  // Placeholder for handling quantity change in modal
  const handleModalQuantityChange = (delta: number) => {
     setModalQuantity(prev => Math.max(1, prev + delta)); // Ensure quantity is at least 1
  };

  // Placeholder for handling notes change in modal
  const handleModalNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     setModalNotes(e.target.value);
  };

  // Handler for changing addon quantity in the modal
  const handleModalAddonQuantityChange = (addonId: number, quantity: number) => {
    // Ensure quantity is a non-negative number
    const newQuantity = Math.max(0, isNaN(quantity) ? 0 : quantity);

    setModalSelectedAddons(prev => {
      const existingAddon = prev.find(a => a.addonId === addonId);

      if (newQuantity === 0 && existingAddon) {
        // Remove addon if quantity becomes 0
        return prev.filter(a => a.addonId !== addonId);
      } else if (existingAddon) {
        // Update quantity of existing addon
        return prev.map(a =>
          a.addonId === addonId ? { ...a, quantity: newQuantity } : a
        );
      } else if (newQuantity > 0) {
        // Add new addon if quantity > 0 and it wasn't previously selected
        // (This case might be less common if the input only appears after checking the box)
        return [...prev, { addonId, quantity: newQuantity, notes: '' }];
      }
      // If quantity is 0 and addon wasn't selected, do nothing
      return prev;
    });
  };

  const handleConfirmAddItem = () => {
    if (!selectedProductForModal) return;

    const newCartItem: CartItem = {
      productId: selectedProductForModal.id,
      quantity: modalQuantity,
      notes: modalNotes,
      addons: modalSelectedAddons,
    };

    setCart(prevCart => [...prevCart, newCartItem]);
    setIsAddItemModalOpen(false); // Close modal after adding
  };

  // --- End Handlers for Add Item Modal ---

  // Get unique event IDs from event-only items
  const eventOnlyEventIds = Array.from(
    new Set(
      cart
        .filter((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product?.eventOnly;
        })
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return product?.eventId;
        })
        .filter(Boolean) as number[]
    )
  );

  // Get events for event-only items
  const eventOnlyEvents = events.filter((event) => eventOnlyEventIds.includes(event.id));

  // Set default event ID if there's only one event-only event
  useEffect(() => {
    if (hasEventOnlyItems && eventOnlyEventIds.length === 1 && !customerInfo.eventId) {
      setCustomerInfo((prev) => ({
        ...prev,
        pickupAtEvent: true,
        eventId: eventOnlyEventIds[0],
      }));
    }
  }, [hasEventOnlyItems, eventOnlyEventIds, customerInfo.eventId]);

  // Toggle using stored info
  const handleToggleStoredInfo = (useStored: boolean) => {
    setUseStoredInfo(useStored);

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
      });
    } else {
      // Restore saved info from localStorage
      const savedCustomerInfo = localStorage.getItem("pastryCustomerInfo");
      if (savedCustomerInfo) {
        try {
          const parsedInfo = JSON.parse(savedCustomerInfo) as CustomerInfo;
          // Keep event-related settings from current state since they're contextual to this order
          setCustomerInfo({
            ...parsedInfo,
            pickupAtEvent: customerInfo.pickupAtEvent,
            eventId: customerInfo.eventId,
          });
        } catch (error) {
          console.error("Error parsing saved customer info:", error);
        }
      }
    }
  };

  // Handle checkbox change for saving customer info
  const handleSaveInfoChange = (checked: boolean) => {
    setSaveInfo(checked);
  };

  // Calculate item price including add-ons
  const calculateItemPrice = (productId: number, cartAddons: CartAddOn[]) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return 0;

    const basePrice = product.price;
    const addonsPrice = cartAddons.reduce((sum, cartAddon) => {
      const addon = addons.find((a) => a.id === cartAddon.addonId);
      return sum + (addon?.price || 0) * cartAddon.quantity;
    }, 0);

    return basePrice + addonsPrice;
  };

  // Calculate total price
  const totalPrice = cart.reduce((sum, item) => {
    const itemPrice = calculateItemPrice(item.productId, item.addons);
    return sum + itemPrice * item.quantity;
  }, 0);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerInfo((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (name in errors) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  // Handle checkbox change
  const handleDeliveryChange = (checked: boolean) => {
    // Can't have both delivery and event pickup
    if (checked && customerInfo.pickupAtEvent) {
      setCustomerInfo((prev) => ({
        ...prev,
        delivery: checked,
        pickupAtEvent: false,
        eventId: undefined,
      }));
    } else {
      setCustomerInfo((prev) => ({ ...prev, delivery: checked }));
    }

    if (!checked) {
      setCustomerInfo((prev) => ({ ...prev, deliveryAddress: "" }));
      setErrors((prev) => ({ ...prev, deliveryAddress: false }));
    }
  };

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
      }));
    } else {
      setCustomerInfo((prev) => ({
        ...prev,
        pickupAtEvent: checked,
        eventId: checked ? (eventOnlyEventIds.length === 1 ? eventOnlyEventIds[0] : prev.eventId) : undefined,
      }));
    }

    if (!checked) {
      setCustomerInfo((prev) => ({ ...prev, eventId: undefined }));
      setErrors((prev) => ({ ...prev, eventId: false }));
    }
  };

  // Handle event selection
  const handleEventChange = (value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      eventId: Number.parseInt(value),
    }));
    setErrors((prev) => ({ ...prev, eventId: false }));
  };

  // Handle contact method change
  const handleContactMethodChange = (value: string) => {
    setCustomerInfo((prev) => ({
      ...prev,
      contactMethod: value as ContactMethod,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      name: !customerInfo.name.trim(),
      email: !customerInfo.email.trim() || !/^\S+@\S+\.\S+$/.test(customerInfo.email),
      phone: !customerInfo.phone.trim(),
      deliveryAddress: customerInfo.delivery && !customerInfo.deliveryAddress.trim(),
      eventId: customerInfo.pickupAtEvent && !customerInfo.eventId ? true : false,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  // Function to update an order
  const updateOrder = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare order data for API
      const orderData = {
        items: cart,
        customer: customerInfo,
        eventId: customerInfo.eventId,
      };

      // Send order to API
      await fetchApi(`orders/unique/${uniqueOrderId}`, {
        method: "PUT",
        body: JSON.stringify(orderData),
      });

      // Save customer info if checkbox is checked
      if (saveInfo) {
        localStorage.setItem("pastryCustomerInfo", JSON.stringify(customerInfo));
      }

      // Show success message
      setOrderUpdated(true);
    } catch (error) {
      console.error("Error updating order:", error);
      setSubmitError("Failed to update order. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await updateOrder();
    }
  };

  // Go back to main page
  const goBack = () => {
    router.push("/orders");
  };

  // Get selected event
  const selectedEvent = customerInfo.eventId ? events.find((event) => event.id === customerInfo.eventId) : null;

  // Handler to change item quantity
  const handleQuantityChange = (itemIndex: number, delta: number) => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      const item = newCart[itemIndex];
      if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          // Remove item if quantity is 0 or less
          return newCart.filter((_, index) => index !== itemIndex);
        } else {
          // Update quantity
          newCart[itemIndex] = { ...item, quantity: newQuantity };
          return newCart;
        }
      }
      return prevCart; // Should not happen if index is valid
    });
  };

  // Handler to remove an item completely
  const handleRemoveItem = (itemIndex: number) => {
    setCart((prevCart) => prevCart.filter((_, index) => index !== itemIndex));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <p>Loading...</p>
      </div>
    );
  }

  if (cart.length === 0 && !orderUpdated) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[50vh]">
        <p className="mb-4">Your order is now empty.</p>
        <Button onClick={goBack}>Return to Orders</Button>
      </div>
    );
  }

  if (orderUpdated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Order Updated!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">
              Your order has been successfully updated. We will contact you shortly via your preferred method (
              {customerInfo.contactMethod}) to confirm your order details
              {customerInfo.delivery ? " and provide delivery cost information" : ""}
              {customerInfo.pickupAtEvent && selectedEvent ? ` for pickup at ${selectedEvent.name}` : ""}.
            </p>
            <Button onClick={goBack} className="w-full">
              Return to Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0" onClick={goBack}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Edit Order Summary</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-10 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div className="col-span-4">Item</div>
                  <div className="col-span-1 text-right">Unit</div>
                  <div className="col-span-3 text-center">Quantity</div>
                  <div className="col-span-1 text-right">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>

                {cart.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  if (!product) return null;

                  const productBasePrice = product.price;
                  const itemTotalWithAddons = calculateItemPrice(item.productId, item.addons) * item.quantity;

                  return (
                    <div key={`${item.productId}-${index}`} className="space-y-3 pb-3 border-b last:border-0">
                      <div className="grid grid-cols-10 items-center">
                        <div className="col-span-4">
                          <div className="flex items-start gap-2">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.eventOnly && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Event Only
                                </Badge>
                              )}
                              {item.notes && <p className="text-xs text-muted-foreground italic mt-1">Note: {item.notes}</p>}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-1 text-right">${productBasePrice.toFixed(2)}</div>
                        <div className="col-span-3 flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(index, -1)}
                            disabled={isSubmitting}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleQuantityChange(index, 1)}
                            disabled={isSubmitting}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="col-span-1 text-right font-medium">${(productBasePrice * item.quantity).toFixed(2)}</div>
                        <div className="col-span-1 flex justify-end">
                           <Button
                             variant="ghost"
                             size="icon"
                             className="h-6 w-6 text-destructive hover:text-destructive"
                             onClick={() => handleRemoveItem(index)}
                             disabled={isSubmitting}
                           >
                             <X className="h-4 w-4" />
                           </Button>
                        </div>
                      </div>

                      {item.addons.length > 0 && (
                        <div className="space-y-2 pl-4 ml-2 border-l-2 border-muted col-span-10">
                          {item.addons.map((cartAddon, addonIndex) => {
                            const addon = addons.find((a) => a.id === cartAddon.addonId);
                            if (!addon) return null;

                            return (
                              <div key={addonIndex} className="grid grid-cols-10 items-start text-sm">
                                <div className="col-span-4">
                                  <p>+ {addon.name}</p>
                                  {cartAddon.notes && <p className="text-xs text-muted-foreground italic">Note: {cartAddon.notes}</p>}
                                </div>
                                <div className="col-span-1 text-right">${addon.price.toFixed(2)}</div>
                                <div className="col-span-3 text-center">{cartAddon.quantity}</div>
                                <div className="col-span-1 text-right">${(addon.price * cartAddon.quantity).toFixed(2)}</div>
                                <div className="col-span-1"></div>
                              </div>
                            );
                          })}

                          <div className="grid grid-cols-10 items-start text-sm pt-2 mt-2 border-t">
                            <div className="col-span-7 font-medium">Item Total (incl. add-ons)</div>
                            <div className="col-span-2 text-right font-medium">${itemTotalWithAddons.toFixed(2)}</div>
                            <div className="col-span-1"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-3 border-t mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <p>Order Total</p>
                    <p>${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Add More Items Button */}
          <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-4 w-full" onClick={handleOpenAddItemModal}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add More Items
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]"> {/* Wider modal */}
              <DialogHeader>
                <DialogTitle>{selectedProductForModal ? `Configure ${selectedProductForModal.name}` : "Add Item to Order"}</DialogTitle>
              </DialogHeader>

              {/* Modal Content Switches Between Steps */}
              {!selectedProductForModal ? (
                // Step 1: Product List
                <ScrollArea className="h-[400px] pr-4"> {/* Added ScrollArea */}
                   <div className="space-y-3 py-4">
                    {availableProductsForModal.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                          {/* Add description or image if available */}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleSelectProductForModal(product)}>
                          Select
                        </Button>
                      </div>
                    ))}
                   </div>
                 </ScrollArea>
              ) : (
                // Step 2: Product Configuration (Basic Structure)
                <div className="space-y-4 py-4">
                   <h3 className="text-lg font-semibold">{selectedProductForModal.name}</h3>
                   <p className="text-sm text-muted-foreground">{selectedProductForModal.description}</p>
                   <p className="text-lg font-bold">${selectedProductForModal.price.toFixed(2)}</p>
                   <Separator />

                   {/* Quantity */}
                   <div className="flex items-center gap-4">
                        <Label className="w-16">Quantity</Label>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8" // Slightly larger buttons
                            onClick={() => handleModalQuantityChange(-1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center font-medium text-lg">{modalQuantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleModalQuantityChange(1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                   </div>

                   {/* Notes */}
                   <div>
                      <Label htmlFor="modalNotes">Notes (Optional)</Label>
                      <Textarea
                         id="modalNotes"
                         value={modalNotes}
                         onChange={handleModalNotesChange}
                         placeholder="Any special requests?"
                         className="mt-1"
                      />
                   </div>

                   {/* Add-ons (Placeholder UI) */}
                   {addons.filter(a => selectedProductForModal.applicableAddons?.includes(a.id)).length > 0 && (
                       <div>
                           <h4 className="font-medium mb-2">Available Add-ons</h4>
                           <div className="space-y-2">
                              {addons
                                .filter(a => selectedProductForModal.applicableAddons?.includes(a.id))
                                .map(addon => {
                                    const isSelected = modalSelectedAddons.some(msa => msa.addonId === addon.id);
                                    return (
                                        <div key={addon.id} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                             <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`modal-addon-${addon.id}`}
                                                    checked={isSelected}
                                                    onCheckedChange={(checked) => handleModalAddonChange(addon.id, !!checked)} // Basic add/remove
                                                />
                                                <Label htmlFor={`modal-addon-${addon.id}`}>
                                                    {addon.name} (+${addon.price.toFixed(2)})
                                                </Label>
                                                {/* TODO: Add quantity input for addons if needed */}
                                                <Input type="number" min={0} value={modalSelectedAddons.find(msa => msa.addonId === addon.id)?.quantity || 0} onChange={(e) => handleModalAddonQuantityChange(addon.id, parseInt(e.target.value))} />
                                             </div>
                                             {/* Display addon details/description? */}
                                             <p>{addon.description}</p>
                                        </div>
                                    );
                                })
                              }
                           </div>
                       </div>
                   )}

                   {/* TODO: Add error display if needed (e.g., for required addons) */}

                   <DialogFooter className="mt-6 gap-2 sm:justify-between"> {/* Adjusted footer layout */}
                     <Button variant="outline" onClick={() => setSelectedProductForModal(null)}>
                        Back to Products
                     </Button>
                     <Button onClick={handleConfirmAddItem}>Confirm Add Item</Button>
                   </DialogFooter>
                </div>
              )}

               {/* Show close button only when showing product list? */}
               {!selectedProductForModal && (
                  <DialogFooter>
                     <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                     </DialogClose>
                  </DialogFooter>
                )}
            </DialogContent>
          </Dialog>
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
              {hasStoredInfo && (
                <div className="mb-6 space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {localStorage.getItem("pastryCustomerInfo") ? JSON.parse(localStorage.getItem("pastryCustomerInfo") || "{}").name : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {localStorage.getItem("pastryCustomerInfo") ? JSON.parse(localStorage.getItem("pastryCustomerInfo") || "{}").email : ""}
                        </p>
                      </div>
                    </div>
                    <Button variant={useStoredInfo ? "default" : "outline"} size="sm" onClick={() => handleToggleStoredInfo(true)}>
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
                    <Button variant={!useStoredInfo ? "default" : "outline"} size="sm" onClick={() => handleToggleStoredInfo(false)}>
                      Use New Info
                    </Button>
                  </div>

                  <Separator />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" value={customerInfo.name} onChange={handleInputChange} className={errors.name ? "border-red-500" : ""} />
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
                  <Checkbox id="saveInfo" checked={saveInfo} onCheckedChange={handleSaveInfoChange} />
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="eventPickup"
                        checked={customerInfo.pickupAtEvent}
                        onCheckedChange={handleEventPickupChange}
                        disabled={hasEventOnlyItems}
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

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="delivery"
                        checked={customerInfo.delivery}
                        onCheckedChange={handleDeliveryChange}
                        disabled={hasEventOnlyItems}
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
                        {errors.deliveryAddress && <p className="text-red-500 text-sm mt-1">Delivery address is required</p>}
                        <p className="text-sm text-muted-foreground mt-2">Delivery cost will be disclosed when we contact you.</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Update Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}