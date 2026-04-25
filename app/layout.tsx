import type React from "react"
import "@/app/globals.css"
import { Pacifico, Poppins, Inter } from "next/font/google"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata = {
  title: "Jus Treats — Sweet Treats Made With Love",
  description: "Homemade pastries, bake-sale favourites and seasonal specials.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${pacifico.variable} ${poppins.variable} ${inter.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
