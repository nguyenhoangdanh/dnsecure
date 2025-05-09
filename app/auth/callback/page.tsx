// In app/auth/callback/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authService } from "@/lib/services/auth-service"
import { useAuth } from "@/hooks"

export default function AuthCallback() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // const { refreshUser } = useAuth()
    const [error, setError] = useState<string | null>(null)

    // useEffect(() => {
    //     const processCallback = async () => {
    //         try {
    //             // Check for token in URL
    //             const token = searchParams.get("token")

    //             if (token) {
    //                 // Store token
    //                 const expiresAt = new Date()
    //                 expiresAt.setHours(expiresAt.getHours() + 1) // Assuming 1 hour expiry
    //                 authService.setStoredToken(token, expiresAt)

    //                 // Refresh user data
    //                 await refreshUser()

    //                 // Redirect to callbackUrl or dashboard
    //                 const callbackUrl = searchParams.get("callbackUrl") || "/"
    //                 router.push(callbackUrl)
    //             } else {
    //                 setError("No authentication token provided")
    //             }
    //         } catch (error) {
    //             console.error("Auth callback error:", error)
    //             setError("Authentication failed")
    //         }
    //     }

    //     processCallback()
    // }, [router, searchParams, refreshUser])

    return (
        <div className="flex items-center justify-center min-h-screen">
            {error ? (
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
                    <p className="mt-2">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => router.push("/login")}
                    >
                        Return to Login
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Authenticating...</h1>
                    <p className="mt-2">Please wait while we sign you in</p>
                </div>
            )}
        </div>
    )
}