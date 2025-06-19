// src/components/auth/TwoFactorVerifyForm.tsx
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyLoginTwoFactorRequest } from "@/redux-saga/slices/twoFactorSlice";
import { RootState } from "@/redux-saga/store";
import { Loader } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TwoFactorVerifyFormProps {
    onCancel?: () => void;
}

export function TwoFactorVerifyForm({ onCancel }: TwoFactorVerifyFormProps) {
    const dispatch = useDispatch();
    const { isLoading, error, sessionId } = useSelector((state: RootState) => state.twoFactor);
    const [verificationCode, setVerificationCode] = useState("");
    const [remainingTime, setRemainingTime] = useState(300); // 5 phút
    const [focused, setFocused] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Kiểm tra session khi component mount
    useEffect(() => {
        if (!sessionId) {
            setFormError("Session information is missing. Please try logging in again.");
            console.error("No sessionId found when mounting TwoFactorVerifyForm");
        } else {
            console.log(`2FA Form using sessionId: ${sessionId}`);
        }
    }, [sessionId]);

    // Xử lý đếm ngược thời gian
    useEffect(() => {
        if (remainingTime <= 0) {
            // Nếu hết thời gian và có hàm onCancel, gọi nó
            if (onCancel) {
                onCancel();
            }
            return;
        }

        const timer = setTimeout(() => {
            setRemainingTime(prevTime => prevTime - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [remainingTime, onCancel]);

    // Format thời gian còn lại
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId) {
            console.error("Missing sessionId for 2FA verification");
            toast.error("Session ID is missing. Please try logging in again.");
            if (onCancel) {
                onCancel();
            }
            return;
        }

        if (verificationCode.trim().length !== 6) {
            toast.error("Please enter a valid 6-digit verification code");
            return;
        }

        console.log(`Submitting 2FA verification with sessionId: ${sessionId}`);
        dispatch(verifyLoginTwoFactorRequest({
            token: verificationCode,
            sessionId
        }));
    };

    // Tự động focus vào input khi component được mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setFocused(true);
        }, 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="grid gap-6">
            <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">Two-Factor Authentication</h1>
                <p className="text-sm text-muted-foreground">
                    Enter the verification code from your authenticator app to continue
                </p>
            </div>

            {(error || formError) && (
                <Alert variant="destructive">
                    <AlertDescription>{error || formError}</AlertDescription>
                </Alert>
            )}

            {!sessionId ? (
                <div className="text-center">
                    <p className="text-red-500 mb-4">Session information is missing. Please try logging in again.</p>
                    <Button onClick={onCancel}>Return to Login</Button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="verificationCode">Verification Code</Label>
                        <Input
                            id="verificationCode"
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                            autoComplete="one-time-code"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            autoFocus={focused}
                            required
                            className="tracking-widest text-center text-lg"
                        />
                    </div>

                    <div className="text-sm text-center text-muted-foreground">
                        Time remaining: {formatTime(remainingTime)}
                    </div>

                    <div className="flex flex-col space-y-2">
                        <Button
                            type="submit"
                            disabled={isLoading || verificationCode.length !== 6}
                            className="w-full"
                        >
                            {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Verify
                        </Button>

                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            )}

            <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have access to your authenticator app? </span>
                <a
                    href="#"
                    className="text-primary underline hover:text-primary/90"
                    onClick={(e) => {
                        e.preventDefault();
                        alert("Use a backup code from the list provided when you set up 2FA.");
                    }}
                >
                    Use a backup code
                </a>
            </div>
        </div>
    );
}