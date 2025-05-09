// In auth-context.tsx
"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, RegisterCredentials, VerifyRegistration } from "../types/auth"
import { authService } from "../services/auth-service";

interface IErrorResponse {
    success: boolean;
    error?: {
        error: string;
        message: string;
        statusCode: number;
    } | string
}

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<IErrorResponse>
    register: (credentials: RegisterCredentials) => Promise<IErrorResponse>
    verifyAccount: (credentials: VerifyRegistration) => Promise<IErrorResponse>
    logout: () => Promise<void>
    sendMagicLink: (email: string) => Promise<any>
    verifyMagicLink: (token: string) => Promise<any>
    refreshUser: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        accessToken: null,
        expiresAt: null,
        status: "loading",
    })

    // Reference to refresh timer
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Function to set up token refresh timer
    const setupRefreshTimer = (expiresAt: Date) => {
        // Clear any existing timer
        if (refreshTimerRef.current) {
            clearTimeout(refreshTimerRef.current)
        }

        // Calculate time until token expiry (75% of the way through)
        const now = new Date().getTime()
        const expiry = expiresAt.getTime()
        const timeUntilExpiry = expiry - now

        // Refresh at 75% of the token lifetime
        const refreshTime = timeUntilExpiry * 0.75

        // Set up refresh timer
        refreshTimerRef.current = setTimeout(async () => {
            try {
                const response = await authService.refreshToken()

                if (response.success && response.data) {
                    const { user, accessToken, expiresAt } = response.data

                    // Update auth state
                    setAuthState({
                        user,
                        accessToken,
                        expiresAt: new Date(expiresAt),
                        status: "authenticated",
                    })

                    // Set up next refresh timer
                    setupRefreshTimer(new Date(expiresAt))
                }
            } catch (error) {
                console.error("Token refresh failed:", error)
            }
        }, refreshTime)
    }

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Validate token by fetching current user
                const response = await authService.getCurrentUser()

                if (response.success && response.data) {
                    // Get token from localStorage (fallback)
                    const token = authService.getStoredToken()
                    const expiresAtStr = localStorage.getItem("tokenExpiresAt")
                    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : new Date(Date.now() + 3600 * 1000)

                    setAuthState({
                        user: response.data,
                        accessToken: token,
                        expiresAt: expiresAt,
                        status: "authenticated",
                    })

                    // Set up refresh timer
                    setupRefreshTimer(expiresAt)
                } else {
                    // Token is invalid
                    authService.clearStoredToken()
                    setAuthState({
                        user: null,
                        accessToken: null,
                        expiresAt: null,
                        status: "unauthenticated",
                    })
                }
            } catch (error) {
                console.error("Failed to initialize auth:", error)
                setAuthState({
                    user: null,
                    accessToken: null,
                    expiresAt: null,
                    status: "unauthenticated",
                })
            }
        }

        initAuth()

        // Clean up refresh timer on unmount
        return () => {
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current)
            }
        }
    }, [])

    const login = async (credentials: LoginCredentials): Promise<IErrorResponse> => {
        try {
            const response = await authService.login(credentials)

            if (response.success && response.data) {
                const { user, accessToken, expiresAt } = response.data

                // Store token in localStorage as fallback
                authService.setStoredToken(accessToken, new Date(expiresAt))

                // Update auth state
                setAuthState({
                    user,
                    accessToken,
                    expiresAt: new Date(expiresAt),
                    status: "authenticated",
                })

                // Set up refresh timer
                setupRefreshTimer(new Date(expiresAt))

                return { success: true }
            }

            return {
                success: false,
                error: response.error || "Login failed",
            }
        } catch (error) {
            console.error("Login error:", error)
            return {
                success: false,
                error: "An unexpected error occurred",
            }
        }
    }

    const register = async (credentials: RegisterCredentials): Promise<IErrorResponse> => {
        try {
            const response = await authService.register(credentials)

            if (response.success) {
                // await authService.verifyRegistration(credentials.email);
                // const { user, accessToken, expiresAt } = response.data

                // // Store token in localStorage as fallback
                // authService.setStoredToken(accessToken, new Date(expiresAt))

                // // Update auth state
                // setAuthState({
                //     user,
                //     accessToken,
                //     expiresAt: new Date(expiresAt),
                //     status: "authenticated",
                // })

                // // Set up refresh timer
                // setupRefreshTimer(new Date(expiresAt))

                return { success: true }
            }

            return {
                success: false,
                error: response.error || "Registration failed",
            }
        } catch (error) {
            console.error("Registration error:", error)
            return {
                success: false,
                error: "An unexpected error occurred",
            }
        }
    }

    const verifyAccount = async (credentials: VerifyRegistration): Promise<IErrorResponse> => {
        try {
            const response = await authService.verifyRegistration(credentials)

            if (response.success && response.data) {
                const { user, accessToken, expiresAt } = response.data

                // Store token in localStorage as fallback
                authService.setStoredToken(accessToken, new Date(expiresAt))

                // Update auth state
                setAuthState({
                    user,
                    accessToken,
                    expiresAt: new Date(expiresAt),
                    status: "authenticated",
                })

                // Set up refresh timer
                setupRefreshTimer(new Date(expiresAt))

                return { success: true }
            }

            return {
                success: false,
                error: response.error || "Verify registration failed",
            }
        } catch (error) {
            console.error("Verify registration error:", error)
            return {
                success: false,
                error: `Verify registration error: ${error}`,
            }
        }
    }


    const logout = async () => {
        try {
            // Call logout API
            await authService.logout()

            // Clear token from storage
            authService.clearStoredToken()

            // Clear refresh timer
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current)
                refreshTimerRef.current = null
            }

            // Update auth state
            setAuthState({
                user: null,
                accessToken: null,
                expiresAt: null,
                status: "unauthenticated",
            })

            // Redirect to home page
            router.push("/")
        } catch (error) {
            console.error("Logout error:", error)

            // Even if API logout fails, we should clear local state
            authService.clearStoredToken()
            setAuthState({
                user: null,
                accessToken: null,
                expiresAt: null,
                status: "unauthenticated",
            })
            router.push("/")
        }
    }

    const sendMagicLink = async (email: string) => {
        try {
            const response = await authService.sendMagicLink(email)

            return {
                success: response.success,
                error: response.error,
            }
        } catch (error) {
            console.error("Magic link error:", error)
            return {
                success: false,
                error: "An unexpected error occurred",
            }
        }
    }


    const verifyMagicLink = async (token: string) => {
        try {
            const response = await authService.verifyMagicLink(token)

            if (response.success && response.data) {
                const { user, accessToken, expiresAt } = response.data

                // Store token in localStorage as fallback
                authService.setStoredToken(accessToken, new Date(expiresAt))

                // Update auth state
                setAuthState({
                    user,
                    accessToken,
                    expiresAt: new Date(expiresAt),
                    status: "authenticated",
                })

                // Set up refresh timer
                setupRefreshTimer(new Date(expiresAt))

                return { success: true }
            }
        } catch (error) {
            console.error("Magic link error:", error)
            return {
                success: false,
                error: "An unexpected error occurred",
            }
        }
    }

    const refreshUser = async () => {
        try {
            const response = await authService.getCurrentUser()

            if (response.success && response.data) {
                setAuthState((prev) => ({
                    ...prev,
                    user: response.data || null,
                }))
            }
        } catch (error) {
            console.error("Failed to refresh user:", error)
        }
    }

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                login,
                register,
                verifyAccount,
                logout,
                sendMagicLink,
                verifyMagicLink,
                refreshUser,
                isAuthenticated: authState.status === "authenticated",
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}