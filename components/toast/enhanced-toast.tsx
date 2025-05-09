"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from "@/lib/utils"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
    {
        variants: {
            variant: {
                default: "bg-background border-border",
                success: "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800",
                error: "bg-red-50 border-red-200 dark:bg-red-950/50 dark:border-red-800",
                warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/50 dark:border-yellow-800",
                info: "bg-blue-50 border-blue-200 dark:bg-blue-950/50 dark:border-blue-800",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const iconVariants = cva("h-5 w-5", {
    variants: {
        variant: {
            default: "text-foreground",
            success: "text-green-600 dark:text-green-400",
            error: "text-red-600 dark:text-red-400",
            warning: "text-yellow-600 dark:text-yellow-400",
            info: "text-blue-600 dark:text-blue-400",
        },
    },
    defaultVariants: {
        variant: "default",
    },
})

export type ToastProps = React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toastVariants> & {
        title?: string
        description?: string
        onClose?: () => void
        duration?: number
        icon?: React.ReactNode
        // Internal props that should not be passed to DOM
        id?: string
        createdAt?: number
    }

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, title, description, onClose, icon, id, createdAt, ...props }, ref) => {
        const shouldReduceMotion = useReducedMotion()

        // Determine which icon to show based on variant
        const IconComponent = React.useMemo(() => {
            if (icon) return icon

            switch (variant) {
                case "success":
                    return <CheckCircle2 className={cn(iconVariants({ variant }))} />
                case "error":
                    return <AlertCircle className={cn(iconVariants({ variant }))} />
                case "warning":
                    return <AlertTriangle className={cn(iconVariants({ variant }))} />
                case "info":
                    return <Info className={cn(iconVariants({ variant }))} />
                default:
                    return null
            }
        }, [variant, icon])

        return (
            <div
                ref={ref}
                className={cn(toastVariants({ variant }), className)}
                {...props}
            >
                {IconComponent && (
                    <motion.div
                        className="flex-shrink-0"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
                    >
                        {IconComponent}
                    </motion.div>
                )}

                <div className="flex-1 flex flex-col gap-1">
                    {title && (
                        <motion.div
                            className={cn(
                                "text-sm font-medium",
                                variant === "success" && "text-green-800 dark:text-green-300",
                                variant === "error" && "text-red-800 dark:text-red-300",
                                variant === "warning" && "text-yellow-800 dark:text-yellow-300",
                                variant === "info" && "text-blue-800 dark:text-blue-300",
                                variant === "default" && "text-foreground"
                            )}
                            initial={{ y: -5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                        >
                            {title}
                        </motion.div>
                    )}

                    {description && (
                        <motion.div
                            className={cn(
                                "text-xs",
                                variant === "success" && "text-green-700 dark:text-green-400",
                                variant === "error" && "text-red-700 dark:text-red-400",
                                variant === "warning" && "text-yellow-700 dark:text-yellow-400",
                                variant === "info" && "text-blue-700 dark:text-blue-400",
                                variant === "default" && "text-muted-foreground"
                            )}
                            initial={{ y: 5, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: shouldReduceMotion ? 0 : 0.2, delay: 0.1 }}
                        >
                            {description}
                        </motion.div>
                    )}
                </div>

                {onClose && (
                    <motion.button
                        className={cn(
                            "absolute right-2 top-2 rounded-md p-1",
                            variant === "success" && "text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900",
                            variant === "error" && "text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900",
                            variant === "warning" && "text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900",
                            variant === "info" && "text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900",
                            variant === "default" && "text-muted-foreground hover:bg-muted"
                        )}
                        onClick={onClose}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <X className="h-4 w-4" />
                    </motion.button>
                )}
            </div>
        )
    }
)
Toast.displayName = "Toast"