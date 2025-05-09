"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAuth } from "@/hooks"
import { Loader } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Enhanced password schema with better validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(10, {
        message: "Password must be at least 10 characters long",
      })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: "Password must include uppercase, lowercase, number, and special character",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type FormData = z.infer<typeof formSchema>

export function ResetPasswordForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { resetPassword } = useAuth();

  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<boolean>(false)
  const [passwordStrength, setPasswordStrength] = React.useState<number>(0)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  })

  // Watch password for strength meter
  const password = watch("password", "");

  // Password strength checker
  React.useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;

    // Length check
    if (password.length >= 10) strength += 20;
    if (password.length >= 12) strength += 10;

    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    // Penalize common patterns
    if (/123|abc|qwerty|password|admin|welcome/i.test(password)) strength -= 25;

    // Ensure strength stays between 0-100
    setPasswordStrength(Math.max(0, Math.min(100, strength)));
  }, [password]);

  // Function to get strength text and color
  const getStrengthInfo = () => {
    if (passwordStrength < 30) return { text: "Weak", color: "text-red-500" };
    if (passwordStrength < 60) return { text: "Fair", color: "text-orange-500" };
    if (passwordStrength < 80) return { text: "Good", color: "text-yellow-500" };
    return { text: "Strong", color: "text-green-500" };
  };

  const strengthInfo = getStrengthInfo();

  // Function to directly dispatch the Redux action
  const dispatchResetPassword = (token: string, password: string, securityData: any) => {
    dispatch({
      type: 'RESET_PASSWORD_REQUEST',
      payload: { token, password, securityData }
    });
  };

  async function onSubmit(data: FormData) {
    if (!token) {
      setError("Reset token is missing");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Add additional security info
      const securityData = {
        timestamp: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenSize: `${window.screen.width}x${window.screen.height}`,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      // Use the direct dispatch function instead of the hook's resetPassword
      dispatchResetPassword(token, data.password, securityData);

      // Success will be handled by the saga with redirect
      setSuccess(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Invalid or missing reset token. Please request a new password reset link.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => router.push("/forgot-password")}>
          Back to Forgot Password
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {success ? (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <AlertDescription className="text-green-600 dark:text-green-400">
            Your password has been reset successfully. Redirecting to login...
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                {...register("password")}
              />
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between mb-1 text-xs">
                    <span>Password strength</span>
                    <span className={strengthInfo.color}>{strengthInfo.text}</span>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className={`h-1 ${passwordStrength < 30 ? "bg-red-100" :
                      passwordStrength < 60 ? "bg-orange-100" :
                        passwordStrength < 80 ? "bg-yellow-100" : "bg-green-100"
                      }`}
                  />
                </div>
              )}
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                placeholder="••••••••"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                disabled={isLoading}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button disabled={isLoading || passwordStrength < 50}>
              {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Reset Password
            </Button>
          </div>
        </form>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        <p>Password requirements:</p>
        <ul className="list-disc pl-4 mt-1 space-y-1">
          <li className={password?.length >= 10 ? "text-green-500" : ""}>At least 10 characters long</li>
          <li className={/[A-Z]/.test(password || "") ? "text-green-500" : ""}>At least one uppercase letter</li>
          <li className={/[a-z]/.test(password || "") ? "text-green-500" : ""}>At least one lowercase letter</li>
          <li className={/[0-9]/.test(password || "") ? "text-green-500" : ""}>At least one number</li>
          <li className={/[^A-Za-z0-9]/.test(password || "") ? "text-green-500" : ""}>At least one special character</li>
        </ul>
      </div>
    </div>
  )
}