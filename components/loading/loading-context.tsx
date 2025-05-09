"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useMemo } from "react"

type LoadingType = "fullscreen" | "page" | "component" | "skeleton" | "none"

interface LoadingContextType {
    isLoading: boolean
    loadingType: LoadingType
    loadingMessage: string | null
    showLoading: (type?: LoadingType, message?: string | null) => void
    hideLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [loadingType, setLoadingType] = useState<LoadingType>("none")
    const [loadingMessage, setLoadingMessage] = useState<string | null>(null)

    const showLoading = useCallback((type: LoadingType = "fullscreen", message: string | null = null) => {
        setIsLoading(true)
        setLoadingType(type)
        setLoadingMessage(message)
    }, [])

    const hideLoading = useCallback(() => {
        setIsLoading(false)
        setLoadingType("none")
        setLoadingMessage(null)
    }, [])

    // Sử dụng useMemo để tránh re-render không cần thiết
    const contextValue = useMemo(
        () => ({
            isLoading,
            loadingType,
            loadingMessage,
            showLoading,
            hideLoading,
        }),
        [isLoading, loadingType, loadingMessage, showLoading, hideLoading],
    )

    return <LoadingContext.Provider value={contextValue}>{children}</LoadingContext.Provider>
}

export function useLoading() {
    const context = useContext(LoadingContext)
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider")
    }
    return context
}
