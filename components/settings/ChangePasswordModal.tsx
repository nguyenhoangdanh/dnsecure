"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { authService } from "@/lib/services/auth-service"
import { PasswordInput } from "../custom/PasswordInput"
import { getErrorMessage } from "@/lib/utils/error-handler"

// Enhanced password schema with better validation
const formSchema = z
    .object({
        currentPassword: z.string().min(1, {
            message: "Mật khẩu hiện tại không được để trống",
        }),
        newPassword: z
            .string()
            .min(10, {
                message: "Mật khẩu phải có ít nhất 10 ký tự",
            })
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
                message: "Mật khẩu phải bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
            }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Mật khẩu không khớp",
        path: ["confirmPassword"],
    })

type FormData = z.infer<typeof formSchema>

interface ChangePasswordModalProps {
    isOpen: boolean
    onClose: () => void
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)
    const [success, setSuccess] = React.useState<boolean>(false)
    const [passwordStrength, setPasswordStrength] = React.useState<number>(0)

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    })

    // Watch password for strength meter
    const newPassword = watch("newPassword", "");

    // Password strength checker
    React.useEffect(() => {
        if (!newPassword) {
            setPasswordStrength(0);
            return;
        }

        let strength = 0;

        // Length check
        if (newPassword.length >= 10) strength += 20;
        if (newPassword.length >= 12) strength += 10;

        // Complexity checks
        if (/[A-Z]/.test(newPassword)) strength += 20;
        if (/[a-z]/.test(newPassword)) strength += 15;
        if (/[0-9]/.test(newPassword)) strength += 20;
        if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;

        // Penalize common patterns
        if (/123|abc|qwerty|password|admin|welcome/i.test(newPassword)) strength -= 25;

        // Ensure strength stays between 0-100
        setPasswordStrength(Math.max(0, Math.min(100, strength)));
    }, [newPassword]);

    // Function to get strength text and color
    const getStrengthInfo = () => {
        if (passwordStrength < 30) return { text: "Yếu", color: "text-red-500" };
        if (passwordStrength < 60) return { text: "Trung bình", color: "text-orange-500" };
        if (passwordStrength < 80) return { text: "Tốt", color: "text-yellow-500" };
        return { text: "Mạnh", color: "text-green-500" };
    };

    const strengthInfo = getStrengthInfo();

    const handleClose = () => {
        reset();
        setError(null);
        setSuccess(false);
        onClose();
    }

    async function onSubmit(data: FormData) {
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

            const response = await authService.changePassword(
                data.currentPassword,
                data.newPassword
            );

            if (response.success) {
                setSuccess(true);
                // Auto close after success
                setTimeout(() => {
                    handleClose();
                }, 2000);
            } else {
                setError(getErrorMessage(response.error, "Có lỗi xảy ra khi thay đổi mật khẩu"));
            }
        } catch (error: any) {
            console.error("Password change error:", error);
            setError(getErrorMessage(error, "Có lỗi xảy ra khi thay đổi mật khẩu"));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Thay đổi mật khẩu</DialogTitle>
                    <DialogDescription>
                        Cập nhật mật khẩu để tăng cường bảo mật cho tài khoản của bạn.
                    </DialogDescription>
                </DialogHeader>
                {success ? (
                    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <AlertDescription className="text-green-600 dark:text-green-400">
                            Mật khẩu của bạn đã được cập nhật thành công!
                        </AlertDescription>
                    </Alert>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                <PasswordInput
                                    id="currentPassword"
                                    placeholder="••••••••"
                                    autoCapitalize="none"
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    {...register("currentPassword")}
                                />
                                {errors.currentPassword && <p className="text-sm text-red-500">{errors.currentPassword.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                <PasswordInput
                                    id="newPassword"
                                    placeholder="••••••••"
                                    autoCapitalize="none"
                                    autoComplete="new-password"
                                    disabled={isLoading}
                                    {...register("newPassword")}
                                />
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="flex justify-between mb-1 text-xs">
                                            <span>Độ mạnh mật khẩu</span>
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
                                {errors.newPassword && <p className="text-sm text-red-500">{errors.newPassword.message}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    placeholder="••••••••"
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
                        </div>

                        <div className="text-xs text-muted-foreground mt-2">
                            <p>Yêu cầu mật khẩu:</p>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li className={newPassword?.length >= 10 ? "text-green-500" : ""}>Ít nhất 10 ký tự</li>
                                <li className={/[A-Z]/.test(newPassword || "") ? "text-green-500" : ""}>Ít nhất một chữ hoa</li>
                                <li className={/[a-z]/.test(newPassword || "") ? "text-green-500" : ""}>Ít nhất một chữ thường</li>
                                <li className={/[0-9]/.test(newPassword || "") ? "text-green-500" : ""}>Ít nhất một số</li>
                                <li className={/[^A-Za-z0-9]/.test(newPassword || "") ? "text-green-500" : ""}>Ít nhất một ký tự đặc biệt</li>
                            </ul>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={isLoading || passwordStrength < 50}>
                                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Cập nhật mật khẩu
                            </Button>
                        </DialogFooter>
                    </form>
                )}


            </DialogContent>
        </Dialog>
    )
}