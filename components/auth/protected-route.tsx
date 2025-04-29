"use client"

import type React from "react"
import { useProtectedRoute } from "@/lib/hooks/use-protected-route"

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles?: string[]
    redirectTo?: string
    requireVerified?: boolean
    loadingComponent?: React.ReactNode
}

export function ProtectedRoute({
    children,
    requiredRoles = [],
    redirectTo = "/login",
    requireVerified = true,
    loadingComponent = <div className="flex items-center justify-center min-h-screen">Loading...</div>,
}: ProtectedRouteProps) {
    const { isLoading } = useProtectedRoute({
        requiredRoles,
        redirectTo,
        requireVerified,
    })

    if (isLoading) {
        return <>{loadingComponent}</>
    }

    return <>{children}</>
}
