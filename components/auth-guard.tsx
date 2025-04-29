"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { useRole } from "@/lib/contexts/role-context"
import { usePermission } from "@/lib/contexts/permission-context"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"

interface AuthGuardProps {
    children: ReactNode
    requiredRoles?: string[]
    requiredPermissions?: string[]
    redirectTo?: string
    requireVerified?: boolean
    fallback?: ReactNode
}

export function AuthGuard({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = "/login",
    requireVerified = true,
    fallback,
}: AuthGuardProps) {
    const { user, status } = useAuth()
    const { hasRole } = useRole()
    const { hasAllPermissions } = usePermission()
    const router = useRouter()

    const isAuthorized =
        status === "authenticated" &&
        user !== null &&
        (!requireVerified || user.isVerified) &&
        (requiredRoles.length === 0 || requiredRoles.some((role) => hasRole(role))) &&
        (requiredPermissions.length === 0 || hasAllPermissions(requiredPermissions))

    useEffect(() => {
        if (status === "loading") {
            return
        }

        if (!isAuthorized && !fallback) {
            router.push(redirectTo)
        }
    }, [isAuthorized, redirectTo, router, status, fallback])

    if (status === "loading") {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>
    }

    if (!isAuthorized) {
        return fallback || null
    }

    return <>{children}</>
}
