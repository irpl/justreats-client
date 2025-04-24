"use client"

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { fetchApi } from '@/utils/api'

const OrderCard = ({ order, onShowDetails }: { order: any, onShowDetails: (orderId: string) => void }) => {
  return (
    <div className="border rounded-md p-4 mb-4">
      <p className="font-medium">Order ID: {order.unique_order_id}</p>
      <p className="text-sm text-muted-foreground">Date: {order.date}</p>
      <Button size="sm" onClick={() => onShowDetails(order.unique_order_id)} className="mt-2">
        Show Details
      </Button>
    </div>
  )
}

const OrderDetails = ({ order }: { order: any }) => {
  return (
    <div className="border rounded-md p-4 mt-4">
      <h3 className="font-medium">Order Details</h3>
      <p>Order ID: {order.unique_order_id}</p>
      <p>Date: {order.date}</p>
    </div>
  )
}


export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
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

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.map((order) => <OrderCard key={order.unique_order_id} order={order} onShowDetails={handleShowDetails} />)}
      {selectedOrder && <OrderDetails order={selectedOrder} />}
    </main>
  )
}