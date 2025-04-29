import { Suspense } from "react"
import { VerificationCodeForm } from "@/components/verification-code-form"

export default function VerifyCodePage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Verify your account</h1>
          <p className="text-sm text-muted-foreground">Enter the 6-digit code we sent to your email address</p>
        </div>
        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <VerificationCodeForm />
        </Suspense>
      </div>
    </div>
  )
}
