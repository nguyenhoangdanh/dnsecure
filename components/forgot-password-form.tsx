"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAuth } from "@/hooks"
import { Loader } from "lucide-react"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
})

type FormData = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const router = useRouter()
  const dispatch = useAppDispatch();
  const { forgotPassword } = useAuth();
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
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Use the Redux-based forgotPassword action
      dispatch(forgotPassword(data.email));

      // For now, set success manually
      setSuccess(true);
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  // async function onSubmit(data: FormData) {
  //   setIsLoading(true)
  //   setError(null)
  //   setSuccess(false)

  //   try {
  //     const result = await forgotPassword(data.email)

  //     if (result.success) {
  //       setSuccess(true)
  //     } else {
  //       setError(result.error || "Something went wrong")
  //     }
  //   } catch (error) {
  //     setError("An unexpected error occurred")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className="grid gap-6">
      {success ? (
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md">
          <p className="text-green-600 dark:text-green-400 text-sm">
            Password reset link has been sent to your email address.
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
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
