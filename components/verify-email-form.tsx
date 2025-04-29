"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { verifyEmail, resendVerificationEmail } from "@/lib/actions/auth-actions"

export function VerifyEmailForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = React.useState<boolean>(!!token)
  const [isResending, setIsResending] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<boolean>(false)
  const [resendSuccess, setResendSuccess] = React.useState<boolean>(false)

  React.useEffect(() => {
    async function verifyToken() {
      if (!token) return

      try {
        const result = await verifyEmail(token)

        if (result.success) {
          setSuccess(true)
          setTimeout(() => {
            router.push("/")
          }, 3000)
        } else {
          setError(result.error || "Invalid or expired verification token")
        }
      } catch (error) {
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    verifyToken()
  }, [token, router])

  async function handleResendVerification() {
    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      const result = await resendVerificationEmail()

      if (result.success) {
        setResendSuccess(true)
      } else {
        setError(result.error || "Failed to resend verification email")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsResending(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verifying your email...</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
        <p className="text-green-600 dark:text-green-400 text-sm">
          Your email has been verified successfully. Redirecting to login...
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {resendSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
          <p className="text-green-600 dark:text-green-400 text-sm">
            Verification email has been resent. Please check your inbox.
          </p>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Didn't receive the verification email? Check your spam folder or click below to resend.
        </p>
        <Button onClick={handleResendVerification} disabled={isResending} variant="outline">
          {isResending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
          Resend Verification Email
        </Button>
      </div>
    </div>
  )
}
