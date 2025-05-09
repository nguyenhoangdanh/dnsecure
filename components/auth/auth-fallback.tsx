"use client"

import { Loader2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export function AuthFallback() {
    const [loadingText, setLoadingText] = useState("Đang xác thực...")
    const [showExtendedMessage, setShowExtendedMessage] = useState(false)

    // Thay đổi thông báo loading sau một khoảng thời gian để cải thiện UX
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setLoadingText("Đang kiểm tra phiên đăng nhập...")
        }, 2000)

        const timer2 = setTimeout(() => {
            setLoadingText("Đang xác minh quyền truy cập...")
        }, 4000)

        const timer3 = setTimeout(() => {
            setShowExtendedMessage(true)
        }, 6000)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [])

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="mx-auto max-w-md text-center shadow-lg">
                <CardHeader className="pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Xác thực bảo mật</CardTitle>
                    <CardDescription>Vui lòng đợi trong khi chúng tôi xác thực phiên của bạn</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm font-medium">{loadingText}</p>
                        </div>

                        {showExtendedMessage && (
                            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                                <p>Quá trình này đang mất nhiều thời gian hơn dự kiến.</p>
                                <p className="mt-2">
                                    Nếu trang không tải sau vài giây nữa, vui lòng{" "}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        tải lại trang
                                    </button>
                                    .
                                </p>
                            </div>
                        )}

                        <div className="flex w-full justify-center space-x-1 pt-4">
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0.2s]"></div>
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0.4s]"></div>
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0.6s]"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
