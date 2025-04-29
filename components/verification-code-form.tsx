"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/auth-context"

const formSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Verification code must be 6 digits" })
    .max(6, { message: "Verification code must be 6 digits" })
    .regex(/^\d+$/, { message: "Verification code must contain only numbers" }),
})

type FormData = z.infer<typeof formSchema>

export function VerificationCodeForm() {
  const router = useRouter()
  const { verifyAccount } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isResending, setIsResending] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<boolean>(false)
  const [resendSuccess, setResendSuccess] = React.useState<boolean>(false)
  const [countdown, setCountdown] = React.useState<number>(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyAccount(data.code)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(result.error || "Invalid verification code")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleResendCode() {
    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      // In a real app, you would call a resend code function from your auth context
      // For now, we'll simulate success
      setResendSuccess(true)
      setCountdown(60) // Start a 60-second countdown
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="grid gap-6">
      {success ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
          <p className="text-green-600 dark:text-green-400 text-sm">
            Your account has been verified successfully. Redirecting to dashboard...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex justify-center w-full">
                  <Input
                    id="code"
                    className="text-center text-2xl tracking-widest w-48"
                    maxLength={6}
                    placeholder="••••••"
                    {...register("code")}
                    disabled={isLoading}
                  />
                </div>
                {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
              </div>
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              {resendSuccess && (
                <p className="text-sm text-green-500 text-center">
                  A new verification code has been sent to your email
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                Verify Account
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Didn't receive the code? Check your spam folder or click below to resend.
        </p>
        <Button onClick={handleResendCode} disabled={isResending || countdown > 0} variant="outline" className="w-full">
          {isResending ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : countdown > 0 ? (
            `Resend code in ${countdown}s`
          ) : (
            "Resend Code"
          )}
        </Button>
        <div className="mt-4">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
