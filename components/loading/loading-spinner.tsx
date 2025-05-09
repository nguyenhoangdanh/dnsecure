import React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
    variant?: "primary" | "secondary" | "success" | "danger" | "warning"
}

const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
}

const variantClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    success: "border-emerald-500",
    danger: "border-destructive",
    warning: "border-amber-500",
}

export const LoadingSpinner = React.memo(function LoadingSpinner({
    size = "md",
    className = "border-t-2 border-b-2",
    variant = "primary",
}: LoadingSpinnerProps) {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-t-transparent border-b-transparent",
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            aria-label="Loading"
        />
    )
})
