"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useTheme } from "next-themes"
import { Toast, type ToastProps } from "./toast"
import { cn } from "@/lib/utils"

export interface ToastItem extends ToastProps {
    id: string
    createdAt: number
}

interface ToasterProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
    toastClassName?: string
    containerClassName?: string
    visibleToasts?: number
    closeButton?: boolean
    gap?: number
    reverseOrder?: boolean
}

export const useToaster = () => {
    const [toasts, setToasts] = React.useState<ToastItem[]>([])

    const toast = React.useCallback((props: Omit<ToastProps, "onClose">) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast: ToastItem = {
            id,
            createdAt: Date.now(),
            duration: 5000,
            ...props,
        }

        setToasts((prev) => [...prev, newToast])

        return id
    }, [])

    const update = React.useCallback((id: string, props: Partial<ToastProps>) => {
        setToasts((prev) => prev.map((toast) => (toast.id === id ? { ...toast, ...props } : toast)))
    }, [])

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const dismissAll = React.useCallback(() => {
        setToasts([])
    }, [])

    return {
        toast,
        update,
        dismiss,
        dismissAll,
        toasts,
    }
}

export const ToasterContext = React.createContext<ReturnType<typeof useToaster> | null>(null)

export const useToast = () => {
    const context = React.useContext(ToasterContext)
    if (!context) {
        throw new Error("useToast must be used within a ToasterProvider")
    }
    return context
}

export const ToasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const toaster = useToaster()

    return <ToasterContext.Provider value={toaster}>{children}</ToasterContext.Provider>
}

export const Toaster: React.FC<ToasterProps> = ({
    position = "top-right",
    toastClassName,
    containerClassName,
    visibleToasts = 5,
    closeButton = true,
    gap = 8,
    reverseOrder = false,
}) => {
    const { toasts, dismiss } = useToast()
    const { theme = "system" } = useTheme()
    const shouldReduceMotion = useReducedMotion()

    // Filter out expired toasts
    const activeToasts = React.useMemo(() => {
        return toasts
            .filter((toast) => {
                if (!toast.duration) return true
                return Date.now() - toast.createdAt < toast.duration
            })
            .slice(0, visibleToasts)
    }, [toasts, visibleToasts])

    // Set up auto-dismiss
    React.useEffect(() => {
        const timeouts = toasts.map((toast) => {
            if (!toast.duration) return undefined

            const timeout = setTimeout(() => {
                dismiss(toast.id)
            }, toast.duration)

            return { id: toast.id, timeout }
        })

        return () => {
            timeouts.forEach((item) => {
                if (item?.timeout) clearTimeout(item.timeout)
            })
        }
    }, [toasts, dismiss])

    // Position styles
    const positionStyles = React.useMemo(() => {
        switch (position) {
            case "top-left":
                return "top-0 left-0"
            case "top-right":
                return "top-0 right-0"
            case "bottom-left":
                return "bottom-0 left-0"
            case "bottom-right":
                return "bottom-0 right-0"
            case "top-center":
                return "top-0 left-1/2 -translate-x-1/2"
            case "bottom-center":
                return "bottom-0 left-1/2 -translate-x-1/2"
            default:
                return "bottom-0 right-0"
        }
    }, [position])

    // Animation variants based on position
    const getAnimationVariants = React.useCallback(() => {
        const isTop = position.startsWith("top")
        const isBottom = position.startsWith("bottom")
        const isCenter = position.includes("center")

        if (isTop) {
            return {
                initial: { opacity: 0, y: -20, scale: 0.9 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: -10, scale: 0.9 },
            }
        }

        if (isBottom) {
            return {
                initial: { opacity: 0, y: 20, scale: 0.9 },
                animate: { opacity: 1, y: 0, scale: 1 },
                exit: { opacity: 0, y: 10, scale: 0.9 },
            }
        }

        if (isCenter) {
            return {
                initial: { opacity: 0, scale: 0.8 },
                animate: { opacity: 1, scale: 1 },
                exit: { opacity: 0, scale: 0.8 },
            }
        }

        return {
            initial: { opacity: 0, x: 20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
        }
    }, [position])

    const variants = getAnimationVariants()
    const toastsToRender = reverseOrder ? [...activeToasts].reverse() : activeToasts

    return (
        <div
            className={cn("fixed z-[100] flex flex-col p-4 w-full sm:max-w-md", positionStyles, containerClassName)}
            style={{ gap: `${gap}px` }}
            aria-live="polite"
            role="region"
            aria-label="Notifications"
        >
            <AnimatePresence initial={false}>
                {toastsToRender.map((toast) => (
                    <motion.div
                        key={toast.id}
                        layout={!shouldReduceMotion}
                        initial={shouldReduceMotion ? undefined : variants.initial}
                        animate={shouldReduceMotion ? undefined : variants.animate}
                        exit={shouldReduceMotion ? undefined : variants.exit}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1],
                        }}
                        className={cn("flex", toastClassName)}
                    >
                        <Toast
                            {...toast}
                            onClose={closeButton ? () => dismiss(toast.id) : undefined}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}