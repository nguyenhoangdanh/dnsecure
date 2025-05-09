"use client"

import React from "react"
import { useLoading } from "./loading-context"
import { LoadingSpinner } from "./loading-spinner"
import { LoadingDots } from "./loading-dots"
import { LoadingIcon } from "./loading-icon"
import { cn } from "@/lib/utils"

type LucideIconType = "loader" | "loader2" | "refreshCw" | "rotateCw" | "hourglass" | "compass"

interface LoadingOverlayProps {
    children?: React.ReactNode
    className?: string
    spinnerVariant?: "spinner" | "dots" | "icon"
    spinnerSize?: "sm" | "md" | "lg" | "xl"
    spinnerColor?: "primary" | "secondary" | "success" | "danger" | "warning"
    iconType?: LucideIconType
    blur?: boolean
}

export const LoadingOverlay = React.memo(function LoadingOverlay({
    children,
    className,
    spinnerVariant = "spinner",
    spinnerSize = "lg",
    spinnerColor = "primary",
    iconType = "loader2",
    blur = true,
}: LoadingOverlayProps) {
    const { isLoading, loadingType, loadingMessage } = useLoading()

    if (!isLoading) return <>{children}</>

    const isFullscreen = loadingType === "fullscreen"
    const isPage = loadingType === "page"
    const isComponent = loadingType === "component"

    const overlayClasses = cn(
        "flex flex-col items-center justify-center",
        {
            "fixed inset-0 z-50 bg-background/80": isFullscreen,
            "absolute inset-0 z-40 bg-background/80": isPage || isComponent,
            "backdrop-blur-sm": blur && (isFullscreen || isPage),
        },
        className,
    )

    let LoadingComponent: React.ReactNode

    if (spinnerVariant === "spinner") {
        LoadingComponent = <LoadingSpinner size={spinnerSize} variant={spinnerColor} />
    } else if (spinnerVariant === "dots") {
        LoadingComponent = <LoadingDots size={spinnerSize} variant={spinnerColor} />
    } else if (spinnerVariant === "icon") {
        LoadingComponent = <LoadingIcon icon={iconType} size={spinnerSize} variant={spinnerColor} />
    }

    return (
        <div className="relative">
            {children}
            <div className={overlayClasses}>
                {LoadingComponent}
                {loadingMessage && <p className="mt-4 text-center text-muted-foreground">{loadingMessage}</p>}
            </div>
        </div>
    )
})

