import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { LoadingProvider } from "@/components/loading/loading-context"
// import { Toaster } from "@/components/ui/sonner"
import { ToastProvider } from "@/components/toast/toast-provider"
import ReduxAuthProvider from "@/provider/ReduxAuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Authentication System",
  description: "Complete authentication system with Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReduxAuthProvider>
            <LoadingProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </LoadingProvider>
          </ReduxAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
