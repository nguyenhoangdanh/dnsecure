"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { AuthState, LoginCredentials, RegisterCredentials } from "../types/auth"
import { authService } from "../services/auth-service"

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
    register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>
    logout: () => Promise<void>
    sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>
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

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            // Check for token in localStorage
            const token = authService.getStoredToken()

            if (!token || authService.isTokenExpired()) {
                setAuthState({
                    user: null,
                    accessToken: null,
                    expiresAt: null,
                    status: "unauthenticated",
                })
                return
            }

            try {
                // Validate token by fetching current user
                const response = await authService.getCurrentUser()

                if (response.success && response.data) {
                    setAuthState({
                        user: response.data,
                        accessToken: token,
                        expiresAt: new Date(localStorage.getItem("tokenExpiresAt") || ""),
                        status: "authenticated",
                    })
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
    }, [])

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials)

            if (response.success && response.data) {
                const { user, accessToken, expiresAt } = response.data

                // Store token
                authService.setStoredToken(accessToken, new Date(expiresAt))

                // Update auth state
                setAuthState({
                    user,
                    accessToken,
                    expiresAt: new Date(expiresAt),
                    status: "authenticated",
                })

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

    const register = async (credentials: RegisterCredentials) => {
        try {
            const response = await authService.register(credentials)

            if (response.success && response.data) {
                const { user, accessToken, expiresAt } = response.data

                // Store token
                authService.setStoredToken(accessToken, new Date(expiresAt))

                // Update auth state
                setAuthState({
                    user,
                    accessToken,
                    expiresAt: new Date(expiresAt),
                    status: "authenticated",
                })

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

    const logout = async () => {
        try {
            // Call logout API
            await authService.logout()

            // Clear token from storage
            authService.clearStoredToken()

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

    const refreshUser = async () => {
        try {
            if (!authState.accessToken) return

            const response = await authService.getCurrentUser()

            if (response.success && response.data) {
                setAuthState((prev) => ({
                    ...prev,
                    user: response.data,
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
                logout,
                sendMagicLink,
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
