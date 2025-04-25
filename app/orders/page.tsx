"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { fetchApi } from '@/utils/api'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrderCard = ({ order, onShowDetails, onEditOrder }: { order: any, onShowDetails: (orderId: string) => void, onEditOrder: (orderId: string) => void }) => {
  return (
    <div className="border rounded-md p-4 mb-4 flex justify-between items-center">
      <div>
        <p className="font-medium">Order ID: {order.unique_order_id}</p>
        <p className="text-sm text-muted-foreground">Date: {order.date}</p>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onShowDetails(order.unique_order_id)}>
          Show Details
        </Button>
        <Button size="sm" variant="secondary" onClick={() => onEditOrder(order.unique_order_id)}>
          Edit Order
        </Button>
      </div>
    </div>
  )
}

const OrderDetails = ({ order }: { order: any }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Order ID: {order.unique_order_id}</p>
        <p>Date: {order.date}</p>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  useEffect(() => {
    const storedOrders = localStorage.getItem('pastryOrders')
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }, [])

  const handleShowDetails = async (orderId: string) => {
    const order = await fetchApi(`orders/unique/${orderId}`, { method: 'GET' })
    setSelectedOrder(order)
  }

  const handleEditOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 pl-0" onClick={() => router.push('/')}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Orders</h2>
          <div className="space-y-4">
            {orders.length > 0 ? (
              orders.map((order) => (
                <OrderCard
                  key={order.unique_order_id}
                  order={order}
                  onShowDetails={handleShowDetails}
                  onEditOrder={handleEditOrder}
                />
              ))
            ) : (
              <p className="text-muted-foreground">You have no orders yet.</p>
            )}
          </div>
        </div>

        <div>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </div>
      </div>
    </main>
  )
}