"use client"

import type React from "react"
import { Toaster, ToasterProvider } from "./toaster"


export function ToastProvider({ children }: { children: React.ReactNode }) {
    return (
        <ToasterProvider>
            {children}
            <Toaster />
        </ToasterProvider>
    )
}
