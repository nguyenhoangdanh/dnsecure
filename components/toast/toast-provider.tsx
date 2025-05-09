"use client"

import type React from "react"
import { EnhancedToaster, ToasterProvider } from "./enhanced-toaster"


export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <ToasterProvider>
            {children}
            <EnhancedToaster />
        </ToasterProvider>
    )
}
