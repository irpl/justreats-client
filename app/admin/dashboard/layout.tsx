"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const auth = JSON.parse(localStorage.getItem("adminAuth") || "{}")

    if (!auth.isAuthenticated) {
      router.push("/admin/login")
    } else {
      setIsAuthorized(true)
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
