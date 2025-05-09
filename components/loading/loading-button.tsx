import React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { LoadingSpinner } from "./loading-spinner"
import { LoadingDots } from "./loading-dots"
import { LoadingIcon } from "./loading-icon"
import { cn } from "@/lib/utils"

type LucideIconType = "loader" | "loader2" | "refreshCw" | "rotateCw" | "hourglass" | "compass"

interface LoadingButtonProps extends ButtonProps {
    isLoading?: boolean
    loadingText?: string
    spinnerVariant?: "spinner" | "dots" | "icon"
    spinnerSize?: "sm" | "md"
    iconType?: LucideIconType
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({
        children,
        isLoading,
        loadingText,
        spinnerVariant = "spinner",
        spinnerSize = "sm",
        iconType = "loader2",
        className,
        ...props
    }, ref) => {
        let LoadingComponent: React.ReactNode

        if (spinnerVariant === "spinner") {
            LoadingComponent = <LoadingSpinner size={spinnerSize} variant={props.variant === "destructive" ? "danger" : "primary"} />
        } else if (spinnerVariant === "dots") {
            LoadingComponent = <LoadingDots size={spinnerSize} variant={props.variant === "destructive" ? "danger" : "primary"} />
        } else if (spinnerVariant === "icon") {
            LoadingComponent = <LoadingIcon
                icon={iconType}
                size={spinnerSize}
                variant={props.variant === "destructive" ? "danger" : "primary"}
            />
        }

        return (
            <Button ref={ref} className={cn("relative", className)} disabled={isLoading || props.disabled} {...props}>
                {isLoading && (
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        {LoadingComponent}
                    </span>
                )}
                <span className={cn(isLoading ? "invisible" : "visible")}>{children}</span>
                {isLoading && loadingText && <span className="sr-only">{loadingText}</span>}
            </Button>
        )
    },
)

LoadingButton.displayName = "LoadingButton"

