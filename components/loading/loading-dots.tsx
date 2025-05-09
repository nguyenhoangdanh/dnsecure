import React from "react"
import { cn } from "@/lib/utils"

interface LoadingDotsProps {
    size?: "sm" | "md" | "lg" | "xl"
    className?: string
    variant?: "primary" | "secondary" | "success" | "danger" | "warning"
}

const sizeClasses = {
    sm: "h-1 w-1 mx-0.5",
    md: "h-2 w-2 mx-1",
    lg: "h-3 w-3 mx-1.5",
    xl: "h-4 w-4 mx-2",
}

const variantClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-emerald-500",
    danger: "bg-destructive",
    warning: "bg-amber-500",
}

export const LoadingDots = React.memo(function LoadingDots({
    size = "md",
    className,
    variant = "primary",
}: LoadingDotsProps) {
    return (
        <div className="flex items-center justify-center">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "rounded-full animate-pulse",
                        sizeClasses[size],
                        variantClasses[variant],
                        `animation-delay-${i * 200}`,
                        className
                    )}
                />
            ))}
        </div>
    )
})
