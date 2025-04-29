"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { useAuth } from "@/lib/contexts/auth-context"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address",
    }),
})

type FormData = z.infer<typeof formSchema>

export function MagicLinkForm() {
    const { sendMagicLink } = useAuth()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<boolean>(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(data: FormData) {
        setIsLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const result = await sendMagicLink(data.email)

            if (result.success) {
                setSuccess(true)
            } else {
                setError(result.error || "Failed to send magic link")
            }
        } catch (error) {
            setError("An unexpected error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            {success ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
                    <p className="text-green-600 dark:text-green-400 text-sm">
                        Magic link has been sent to your email address. Please check your inbox.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...register("email")}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button disabled={isLoading}>
                            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                            Send Magic Link
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}
