import React from "react"
import { cn } from "@/lib/utils"

interface LoadingPulseProps {
    className?: string
    width?: string
    height?: string
    rounded?: "none" | "sm" | "md" | "lg" | "full"
}

const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    full: "rounded-full",
}

export const LoadingPulse = React.memo(function LoadingPulse({
    className,
    width = "w-full",
    height = "h-6",
    rounded = "md",
}: LoadingPulseProps) {
    return <div className={cn("animate-pulse bg-muted", width, height, roundedClasses[rounded], className)} />
})
