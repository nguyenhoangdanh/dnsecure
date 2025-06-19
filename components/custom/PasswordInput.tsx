"use client"

import * as React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface PasswordInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    containerClassName?: string
    showPasswordLabel?: string
    hidePasswordLabel?: string
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, containerClassName, showPasswordLabel = "Hiện mật khẩu", hidePasswordLabel = "Ẩn mật khẩu", ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)

        const togglePasswordVisibility = () => {
            setShowPassword((prev) => !prev)
        }

        return (
            <div className={cn("relative", containerClassName)}>
                <Input
                    type={showPassword ? "text" : "password"}
                    className={cn("pr-10", className)}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    aria-label={showPassword ? hidePasswordLabel : showPasswordLabel}
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-0"
                >
                    {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                    ) : (
                        <Eye className="h-5 w-5" />
                    )}
                </button>
            </div>
        )
    }
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }