"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const socialButtonVariants = cva(
    "relative overflow-hidden transition-all duration-300 flex items-center justify-center gap-2 font-medium",
    {
        variants: {
            variant: {
                default: "bg-white text-black hover:bg-gray-100 border border-gray-200",
                google: "bg-white text-black hover:bg-red-50 border border-gray-200 hover:border-red-200",
                facebook: "bg-white text-black hover:bg-blue-50 border border-gray-200 hover:border-blue-200",
                github: "bg-white text-black hover:bg-gray-50 border border-gray-200",
                magic: "bg-white text-black hover:bg-purple-50 border border-gray-200 hover:border-purple-200",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
)

export interface SocialButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof socialButtonVariants> {
    icon?: React.ReactNode
    isLoading?: boolean
    renderIcon?: (isHovered: boolean) => React.ReactNode
}

const SocialButton = React.forwardRef<HTMLButtonElement, SocialButtonProps>(
    ({ className, variant, size, icon, renderIcon, children, isLoading, ...props }, ref) => {
        const [isHovered, setIsHovered] = React.useState(false)

        return (
            <button
                className={cn(socialButtonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onFocus={() => setIsHovered(true)}
                onBlur={() => setIsHovered(false)}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </span>
                ) : renderIcon ? (
                    <span className="relative">{renderIcon(isHovered)}</span>
                ) : icon ? (
                    <span className="relative">{icon}</span>
                ) : null}
                {children}
            </button>
        )
    },
)
SocialButton.displayName = "SocialButton"

export { SocialButton, socialButtonVariants }
