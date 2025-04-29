"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/auth-context"

interface UseProtectedRouteOptions {
  requiredRoles?: string[]
  redirectTo?: string
  requireVerified?: boolean
}

export function useProtectedRoute({
  requiredRoles = [],
  redirectTo = "/login",
  requireVerified = true,
}: UseProtectedRouteOptions = {}) {
  const { user, status, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      return
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(window.location.href)}`)
      return
    }

    // Check if email verification is required and user is not verified
    if (requireVerified && user && !user.emailVerified) {
      router.push("/verify-email")
      return
    }

    // Check if user has required roles
    if (requiredRoles.length > 0 && user && !requiredRoles.some((role) => user.roles.includes(role))) {
      router.push("/unauthorized")
      return
    }
  }, [isAuthenticated, user, status, requiredRoles, requireVerified, redirectTo, router])

  return {
    isAuthenticated,
    isLoading: status === "loading",
    user,
  }
}
