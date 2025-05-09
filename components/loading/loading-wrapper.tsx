import React from "react"
import { LoadingOverlay } from "./loading-overlay"
import { cn } from "@/lib/utils"

type LucideIconType = "loader" | "loader2" | "refreshCw" | "rotateCw" | "hourglass" | "compass"

interface LoadingWrapperProps {
    children: React.ReactNode
    isLoading?: boolean
    className?: string
    spinnerVariant?: "spinner" | "dots" | "icon"
    spinnerSize?: "sm" | "md" | "lg" | "xl"
    spinnerColor?: "primary" | "secondary" | "success" | "danger" | "warning"
    iconType?: LucideIconType
    blur?: boolean
    minHeight?: string
}

export const LoadingWrapper = React.memo(function LoadingWrapper({
    children,
    isLoading = false,
    className,
    spinnerVariant = "spinner",
    spinnerSize = "md",
    spinnerColor = "primary",
    iconType = "loader2",
    blur = true,
    minHeight,
}: LoadingWrapperProps) {
    return (
        <div className={cn("relative", minHeight && `min-h-[${minHeight}]`, className)}>
            {isLoading ? (
                <LoadingOverlay
                    spinnerVariant={spinnerVariant}
                    spinnerSize={spinnerSize}
                    spinnerColor={spinnerColor}
                    iconType={iconType}
                    blur={blur}
                >
                    <div className="invisible">{children}</div>
                </LoadingOverlay>
            ) : (
                children
            )}
        </div>
    )
})
