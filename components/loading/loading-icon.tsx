import React from "react"
import { cn } from "@/lib/utils"
import { Loader, Loader2, RefreshCw, RotateCw, Hourglass, Compass } from 'lucide-react'

type LucideIconType = "loader" | "loader2" | "refreshCw" | "rotateCw" | "hourglass" | "compass"

interface LoadingIconProps {
    icon?: LucideIconType
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
    variant?: "primary" | "secondary" | "success" | "danger" | "warning"
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
}

const variantClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-emerald-500",
    danger: "text-destructive",
    warning: "text-amber-500",
}

const iconComponents: Record<LucideIconType, React.ElementType> = {
    loader: Loader,
    loader2: Loader2,
    refreshCw: RefreshCw,
    rotateCw: RotateCw,
    hourglass: Hourglass,
    compass: Compass,
}

export const LoadingIcon = React.memo(function LoadingIcon({
    icon = "loader2",
    size = "md",
    className,
    variant = "primary",
}: LoadingIconProps) {
    const IconComponent = iconComponents[icon]

    return (
        <IconComponent
            className={cn(
                "animate-spin",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            aria-label="Loading"
        />
    )
})

