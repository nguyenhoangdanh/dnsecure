"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Loader } from "lucide-react"
import { useAuth } from "@/hooks"

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters long",
    }),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export function UserRegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuth()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError(null);


    try {
      // Use the Redux-based register action
      registerUser({
        fullName: data.name,
        email: data.email,
        password: data.password,
        // redirectTo: `/verify-code?email=${encodeURIComponent(data.email)}`
      });

      // Redux will handle the rest through sagas
    } catch (error: any) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }

    // try {
    //   const result = await registerUser({
    //     fullName: data.name,
    //     email: data.email,
    //     password: data.password,
    //   })

    //   if (result.success) {
    //     router.push(`/verify-code?email=${data.email}`)
    //   } else {
    //     // setError(result?.error?.message || "Registration failed")
    //     if (typeof result.error === 'string') {
    //       setError("Registration failed")
    //     } else if (result.error && 'message' in result.error) {
    //       setError(result?.error?.message);
    //     }

    //   }
    // } catch (error) {
    //   setError("An unexpected error occurred")
    // } finally {
    //   setIsLoading(false)
    // }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              disabled={isLoading}
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
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
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              // type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              // type="password"
              autoCapitalize="none"
              autoComplete="new-password"
              disabled={isLoading}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button disabled={isLoading}>
            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <OAuthButtons isLoading={isLoading} />
    </div>
  )
}
