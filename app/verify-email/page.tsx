import Link from "next/link"
import { Suspense } from "react"
import { VerifyEmailForm } from "@/components/verify-email-form"

export default function VerifyEmailPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your email</h1>
          <p className="text-sm text-muted-foreground">We've sent you a verification link. Please check your email.</p>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerifyEmailForm />
        </Suspense>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
