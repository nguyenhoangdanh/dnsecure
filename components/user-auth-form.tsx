"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { loginSchema } from "@/lib/validations/auth"
import { OAuthButtons } from "./auth/oauth-buttons"
import { Loader } from "lucide-react"
import { useAuth } from "@/hooks"
import Link from "next/link"

type FormData = z.infer<typeof loginSchema>

export function UserAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const { login, isAuthenticated, status, error: authError } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [loginAttempts, setLoginAttempts] = useState<number>(0)
  const [loginLocked, setLoginLocked] = useState<boolean>(false)
  const [lockCountdown, setLockCountdown] = useState<number>(0)

  // Get query parameters
  const tokenExpired = searchParams.get("tokenExpired") === "true"
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const reset = searchParams.get("reset") === "success"

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  })

  // Effect to handle authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      router.push(callbackUrl);
    }

    if (authError && !error) {
      setError(authError);
      setIsLoading(false);
      setLoginAttempts(prev => prev + 1);

      // Lock login after 5 consecutive failed attempts
      if (loginAttempts >= 4) { // This will be the 5th attempt
        setLoginLocked(true);
        setLockCountdown(60); // Lock for 60 seconds
      }
    }

    if (isLoading && status !== 'loading' && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, status, authError, router, callbackUrl, error, isLoading, loginAttempts]);

  // Countdown for login lock
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (loginLocked && lockCountdown > 0) {
      timer = setTimeout(() => {
        setLockCountdown(prev => prev - 1);
      }, 1000);
    } else if (lockCountdown === 0 && loginLocked) {
      setLoginLocked(false);
      setLoginAttempts(0);
    }

    return () => clearTimeout(timer);
  }, [loginLocked, lockCountdown]);

  async function onSubmit(data: FormData) {
    if (loginLocked) return;

    setIsLoading(true)
    setError(null)

    try {
      // Create securityInfo object
      const securityInfo = {
        timestamp: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Login with security info
      login({
        email: data.email,
        password: data.password,
        securityInfo
      });

      // Store login time for sensitive operations
      localStorage.setItem('lastLoginTime', new Date().toISOString());
    } catch (error: any) {
      console.error("Login error:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      {reset && (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <AlertDescription className="text-green-600 dark:text-green-400">
            Password reset successful. You can now log in with your new password.
          </AlertDescription>
        </Alert>
      )}

      {tokenExpired && (
        <Alert variant="destructive">
          <AlertDescription>
            Your session has expired. Please login again.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loginLocked ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
            Too many failed login attempts. Please try again in {lockCountdown} seconds.
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
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                placeholder="********"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <Button disabled={isLoading}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </div>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <OAuthButtons isLoading={isLoading || loginLocked} />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link href="/register" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}

// // In components/user-auth-form.tsx
// "use client"

// import { useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import * as z from "zod"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import { loginSchema } from "@/lib/validations/auth"
// import { OAuthButtons } from "./auth/oauth-buttons"
// import { Loader } from "lucide-react"
// import { useAuth } from "@/hooks"

// type FormData = z.infer<typeof loginSchema>

// export function UserAuthForm() {
//   const router = useRouter();
//   const searchParams = useSearchParams()
//   const { login, isAuthenticated, status } = useAuth()
//   const [isLoading, setIsLoading] = useState<boolean>(false)
//   const [error, setError] = useState<string | null>(null)

//   // Check if token has expired from query params
//   const tokenExpired = searchParams.get("tokenExpired") === "true"

//   // Get callback URL
//   const callbackUrl = searchParams.get("callbackUrl") || "/"

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<FormData>({
//     resolver: zodResolver(loginSchema),
//   })

//   async function onSubmit(data: FormData) {
//     setIsLoading(true)
//     setError(null)

//     try {
//       // Use the Redux-based login action
//       // No need to await as Redux will handle the async flow
//       login({
//         email: data.email,
//         password: data.password,
//         // redirectTo: callbackUrl
//       })

//       console.log('isAuthenticated', status)

//       if (isAuthenticated) {
//         router.push(callbackUrl);
//       }

//       // The status changes will be monitored in the component
//       // and the router.push will happen in useEffect when authentication succeeds
//     } catch (error: any) {
//       console.error("Login error:", error);
//       setError("An unexpected error occurred");
//       setIsLoading(false);
//     } finally {
//       setIsLoading(false);
//     }

//     // try {
//     //   const result = await login(data)

//     //   if (result.success) {
//     //     router.push(callbackUrl)
//     //   } else {
//     //     setError(result.error || "Login failed")
//     //   }
//     // } catch (error) {
//     //   console.error("Login error:", error)
//     //   setError("An unexpected error occurred")
//     // } finally {
//     //   setIsLoading(false)
//     // }
//   }

//   return (
//     <div className="grid gap-6">
//       {tokenExpired && (
//         <Alert variant="destructive">
//           <AlertDescription>
//             Your session has expired. Please login again.
//           </AlertDescription>
//         </Alert>
//       )}

//       {error && (
//         <Alert variant="destructive">
//           <AlertDescription>{error}</AlertDescription>
//         </Alert>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="grid gap-4">
//           <div className="grid gap-2">
//             <Label htmlFor="email">Email</Label>
//             <Input
//               id="email"
//               placeholder="name@example.com"
//               type="email"
//               autoCapitalize="none"
//               autoComplete="email"
//               autoCorrect="off"
//               disabled={isLoading}
//               {...register("email")}
//             />
//             {errors.email && (
//               <p className="text-sm text-red-500">{errors.email.message}</p>
//             )}
//           </div>
//           <div className="grid gap-2">
//             <Label htmlFor="password">Password</Label>
//             <Input
//               id="password"
//               placeholder="********"
//               // type="password"
//               autoComplete="current-password"
//               disabled={isLoading}
//               {...register("password")}
//             />
//             {errors.password && (
//               <p className="text-sm text-red-500">{errors.password.message}</p>
//             )}
//           </div>
//           <Button disabled={isLoading}>
//             {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
//             Sign In
//           </Button>
//         </div>
//       </form>
//       <div className="relative">
//         <div className="absolute inset-0 flex items-center">
//           <span className="w-full border-t" />
//         </div>
//         <div className="relative flex justify-center text-xs uppercase">
//           <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
//         </div>
//       </div>
//       <OAuthButtons isLoading={isLoading} />
//     </div>
//   )
// }