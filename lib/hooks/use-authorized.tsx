"use client"

import { useAuth } from "@/lib/contexts/auth-context"
import { useRole } from "@/lib/contexts/role-context"
import { usePermission } from "@/lib/contexts/permission-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface UseAuthorizedOptions {
    requiredRoles?: string[]
    requiredPermissions?: string[]
    redirectTo?: string
    requireVerified?: boolean
}

export function useAuthorized({
    requiredRoles = [],
    requiredPermissions = [],
    redirectTo = "/login",
    requireVerified = true,
}: UseAuthorizedOptions = {}) {
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

        if (!isAuthorized) {
            router.push(redirectTo)
        }
    }, [isAuthorized, redirectTo, router, status])

    return {
        isAuthorized,
        isLoading: status === "loading",
        user,
    }
}
