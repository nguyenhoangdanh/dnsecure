"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { SessionState } from "@/lib/types/auth"
import { createSession, invalidateSession, refreshSession } from "../actions/session-action"

interface SessionContextType {
    session: SessionState | null
    status: "loading" | "active" | "expired"
    createNewSession: (userId: string, deviceInfo?: any) => Promise<SessionState | null>
    refreshCurrentSession: () => Promise<boolean>
    invalidateCurrentSession: () => Promise<boolean>
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
    const [sessionState, setSessionState] = useState<{
        session: SessionState | null
        status: "loading" | "active" | "expired"
    }>({
        session: null,
        status: "loading",
    })

    // Load session on mount
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("/api/auth/session-info")
                const data = await response.json()

                if (data.session) {
                    setSessionState({
                        session: {
                            ...data.session,
                            expiresAt: new Date(data.session.expiresAt),
                        },
                        status: data.session.isActive ? "active" : "expired",
                    })
                } else {
                    setSessionState({
                        session: null,
                        status: "expired",
                    })
                }
            } catch (error) {
                console.error("Failed to fetch session:", error)
                setSessionState({
                    session: null,
                    status: "expired",
                })
            }
        }

        fetchSession()
    }, [])

    // Set up session refresh interval
    useEffect(() => {
        if (!sessionState.session || sessionState.status !== "active") {
            return
        }

        // Calculate time until session expiry (75% of the way through)
        const expiresAt = new Date(sessionState.session.expiresAt).getTime()
        const now = new Date().getTime()
        const timeUntilExpiry = expiresAt - now
        const refreshTime = timeUntilExpiry * 0.75

        // Set up refresh timer
        const refreshTimer = setTimeout(() => {
            refreshCurrentSession()
        }, refreshTime)

        return () => clearTimeout(refreshTimer)
    }, [sessionState.session, sessionState.status])

    const createNewSession = async (userId: string, deviceInfo?: any) => {
        try {
            const result = await createSession(userId, deviceInfo)

            if (result.success && result.session) {
                const newSession = {
                    ...result.session,
                    expiresAt: new Date(result.session.expiresAt),
                }

                setSessionState({
                    session: newSession,
                    status: "active",
                })

                return newSession
            }

            return null
        } catch (error) {
            console.error("Create session error:", error)
            return null
        }
    }

    const refreshCurrentSession = async () => {
        if (!sessionState.session) {
            return false
        }

        try {
            const result = await refreshSession(sessionState.session.id)

            if (result.success && result.session) {
                setSessionState({
                    session: {
                        ...result.session,
                        expiresAt: new Date(result.session.expiresAt),
                    },
                    status: "active",
                })

                return true
            }

            return false
        } catch (error) {
            console.error("Refresh session error:", error)
            return false
        }
    }

    const invalidateCurrentSession = async () => {
        if (!sessionState.session) {
            return false
        }

        try {
            const result = await invalidateSession(sessionState.session.id)

            if (result.success) {
                setSessionState({
                    session: null,
                    status: "expired",
                })

                return true
            }

            return false
        } catch (error) {
            console.error("Invalidate session error:", error)
            return false
        }
    }

    return (
        <SessionContext.Provider
            value={{
                ...sessionState,
                createNewSession,
                refreshCurrentSession,
                invalidateCurrentSession,
            }}
        >
            {children}
        </SessionContext.Provider>
    )
}

export const useSession = () => {
    const context = useContext(SessionContext)
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider")
    }
    return context
}
