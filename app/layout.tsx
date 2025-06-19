import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { LoadingProvider } from "@/components/loading/loading-context"
import ReduxAuthProvider from "@/provider/ReduxAuthProvider"
import { ClientToastProvider } from "@/provider/ClientToastProvider"
import DataTableProviderWrapper from "@/provider/DataTableProviderWrapper"

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
              <ClientToastProvider>
                <DataTableProviderWrapper>
                  {children}
                </DataTableProviderWrapper>
              </ClientToastProvider>
            </LoadingProvider>
          </ReduxAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
