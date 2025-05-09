"use client"

import { useState, useCallback } from "react"
import { useLoading } from "./loading-context"

type LoadingType = "fullscreen" | "page" | "component" | "skeleton" | "none"

export function useLoadingState(defaultType: LoadingType = "component") {
    const [isLoadingLocal, setIsLoadingLocal] = useState(false)
    const { showLoading, hideLoading } = useLoading()

    const startLoading = useCallback(
        (message?: string) => {
            setIsLoadingLocal(true)
            showLoading(defaultType, message)
        },
        [defaultType, showLoading],
    )

    const stopLoading = useCallback(() => {
        setIsLoadingLocal(false)
        hideLoading()
    }, [hideLoading])

    return {
        isLoading: isLoadingLocal,
        startLoading,
        stopLoading,
    }
}
