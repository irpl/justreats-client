import type { ReactNode } from "react"

export const metadata = {
  title: "Admin Dashboard - Sweet Delights Bakery",
  description: "Admin dashboard for managing orders",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-muted/40">{children}</div>
}
