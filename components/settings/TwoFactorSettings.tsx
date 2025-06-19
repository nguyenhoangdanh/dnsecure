import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    enableTwoFactorRequest,
    verifyTwoFactorRequest,
    disableTwoFactorRequest,
    getBackupCodesRequest,
    regenerateBackupCodesRequest,
    checkTwoFactorStatusRequest
} from "@/redux-saga/slices/twoFactorSlice";
import {
    Alert,
    AlertDescription
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { RootState } from "@/redux-saga";

export function TwoFactorSettings() {
    const dispatch = useDispatch();
    const {
        isEnabled,
        isLoading,
        error,
        qrCodeUrl,
        secret,
        backupCodes
    } = useSelector((state: RootState) => state.twoFactor);

    const [verificationCode, setVerificationCode] = useState("");
    const [disablePassword, setDisablePassword] = useState("");
    const [showBackupCodes, setShowBackupCodes] = useState(false);
    const [copied, setCopied] = useState(false);
    const [openDisableDialog, setOpenDisableDialog] = useState(false);

    // Kiểm tra trạng thái 2FA khi component mount
    useEffect(() => {
        dispatch(checkTwoFactorStatusRequest());
    }, [dispatch]);

    // Bắt đầu thiết lập 2FA
    const handleSetup = () => {
        dispatch(enableTwoFactorRequest());
    };

    // Xác minh và kích hoạt 2FA
    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationCode.trim()) {
            dispatch(verifyTwoFactorRequest({ token: verificationCode }));
            setVerificationCode("");
        }
    };

    // Vô hiệu hóa 2FA
    const handleDisable = (e: React.FormEvent) => {
        e.preventDefault();
        if (disablePassword.trim()) {
            dispatch(disableTwoFactorRequest({ password: disablePassword }));
            setDisablePassword("");
            setOpenDisableDialog(false);
        }
    };

    // Lấy mã dự phòng
    const handleGetBackupCodes = () => {
        dispatch(getBackupCodesRequest());
        setShowBackupCodes(true);
    };

    // Tạo lại mã dự phòng
    const handleRegenerateBackupCodes = () => {
        dispatch(regenerateBackupCodesRequest());
        setShowBackupCodes(true);
    };

    // Copy mã dự phòng vào clipboard
    const handleCopyBackupCodes = () => {
        navigator.clipboard.writeText(backupCodes.join('\n'))
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch(() => alert('Failed to copy backup codes'));
    };

    // In mã dự phòng
    const handlePrintBackupCodes = () => {
        const printContent = `
      <html>
        <head>
          <title>Two-Factor Authentication Backup Codes</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { font-size: 18px; }
            ul { list-style-type: none; padding: 0; }
            li { font-family: monospace; font-size: 16px; padding: 5px 0; }
            .warning { color: #cc0000; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Two-Factor Authentication Backup Codes</h1>
          <p>Each backup code can be used once to sign in if you don't have access to your authenticator app.</p>
          <ul>
            ${backupCodes.map(code => `<li>${code}</li>`).join('')}
          </ul>
          <p class="warning">Keep these codes in a safe place. They won't be displayed again.</p>
        </body>
      </html>
    `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Trạng thái hiện tại */}
            <div className={`p-4 rounded-md ${isEnabled ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800'}`}>
                <p className="font-medium">
                    Trạng thái: <span className={isEnabled ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
                        {isEnabled ? "Đã bật" : "Đã tắt"}
                    </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {isEnabled
                        ? "Tài khoản của bạn đang được bảo vệ bằng xác thực hai yếu tố."
                        : "Bật xác thực hai yếu tố để tăng cường bảo mật cho tài khoản."}
                </p>
            </div>

            {/* Thiết lập 2FA */}
            {!isEnabled && !qrCodeUrl && (
                <div className="py-4">
                    <p className="mb-4">
                        Xác thực hai yếu tố bổ sung một lớp bảo mật cho tài khoản của bạn bằng cách yêu cầu
                        mã xác thực từ ứng dụng xác thực ngoài mật khẩu của bạn.
                    </p>
                    <Button
                        onClick={handleSetup}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Thiết lập xác thực hai yếu tố
                    </Button>
                </div>
            )}

            {/* Hiển thị QR code */}
            {!isEnabled && qrCodeUrl && (
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Bước 1: Quét mã QR</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Quét mã QR này bằng ứng dụng xác thực của bạn (Google Authenticator, Authy, v.v.)
                        </p>
                        <div className="p-4 border rounded-md inline-block bg-white">
                            <img src={qrCodeUrl} alt="QR Code for 2FA setup" width={180} height={180} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Bước 2: Thiết lập thủ công (Tùy chọn)</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Nếu bạn không thể quét mã QR, hãy nhập mã này thủ công vào ứng dụng của bạn:
                        </p>
                        <pre className="p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-sm">
                            {secret}
                        </pre>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-lg font-medium">Bước 3: Xác minh thiết lập</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Nhập mã xác thực hiển thị trong ứng dụng xác thực của bạn:
                        </p>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                    placeholder="Nhập mã 6 chữ số"
                                    className="w-40 text-center tracking-widest text-lg"
                                    autoComplete="one-time-code"
                                    inputMode="numeric"
                                    maxLength={6}
                                    required
                                />
                                <Button
                                    type="submit"
                                    disabled={isLoading || verificationCode.length !== 6}
                                >
                                    {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Xác minh
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Mã dự phòng */}
            {isEnabled && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Mã dự phòng</h3>
                        {!showBackupCodes && (
                            <Button
                                variant="outline"
                                onClick={handleGetBackupCodes}
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Xem mã dự phòng
                            </Button>
                        )}

                        {showBackupCodes && backupCodes.length > 0 && (
                            <div className="mt-4 space-y-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Lưu trữ các mã dự phòng này ở nơi an toàn. Mỗi mã có thể được sử dụng một lần nếu bạn mất quyền truy cập vào ứng dụng xác thực.
                                </p>

                                <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
                                    <div className="grid grid-cols-2 gap-2">
                                        {backupCodes.map((code, index) => (
                                            <div key={index} className="font-mono text-sm">
                                                {code}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCopyBackupCodes}
                                    >
                                        {copied ? "Đã sao chép!" : "Sao chép"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePrintBackupCodes}
                                    >
                                        In
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleRegenerateBackupCodes}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        Tạo mã mới
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBackupCodes(false)}
                                    >
                                        Ẩn
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Disable 2FA */}
                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-2">Tắt xác thực hai yếu tố</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Cảnh báo: Điều này sẽ làm giảm bảo mật cho tài khoản của bạn. Bạn cần nhập mật khẩu để tiếp tục.
                        </p>

                        <Dialog open={openDisableDialog} onOpenChange={setOpenDisableDialog}>
                            <DialogTrigger asChild>
                                <Button variant="destructive">
                                    Tắt xác thực hai yếu tố
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tắt xác thực hai yếu tố</DialogTitle>
                                    <DialogDescription>
                                        Nhập mật khẩu của bạn để tắt xác thực hai yếu tố. Điều này sẽ loại bỏ lớp bảo mật bổ sung khỏi tài khoản của bạn.
                                    </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleDisable} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="disablePassword">Mật khẩu</Label>
                                        <Input
                                            id="disablePassword"
                                            type="password"
                                            value={disablePassword}
                                            onChange={(e) => setDisablePassword(e.target.value)}
                                            placeholder="Nhập mật khẩu của bạn"
                                            required
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpenDisableDialog(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={isLoading || !disablePassword}
                                        >
                                            {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Tắt
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}

            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="about-2fa">
                    <AccordionTrigger>Về xác thực hai yếu tố</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                                Xác thực hai yếu tố bổ sung một lớp bảo mật cho tài khoản của bạn bằng cách yêu cầu điều bạn biết (mật khẩu) và điều bạn có (điện thoại hoặc khóa bảo mật).
                            </p>
                            <p>
                                Khi được bật, bạn sẽ cần nhập mã xác thực từ ứng dụng xác thực mỗi khi đăng nhập, ngay cả khi ai đó có mật khẩu của bạn.
                            </p>
                            <p>
                                Các ứng dụng xác thực phổ biến bao gồm Google Authenticator, Authy, Microsoft Authenticator và nhiều trình quản lý mật khẩu.
                            </p>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}