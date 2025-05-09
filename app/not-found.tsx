"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-background">
            <div className="container flex flex-col items-center justify-center max-w-md text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h1 className="text-9xl font-extrabold tracking-tighter text-primary">404</h1>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="mb-8 space-y-4"
                >
                    <h2 className="text-3xl font-bold tracking-tight">Trang không tìm thấy</h2>
                    <p className="text-muted-foreground">Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <Button variant="outline" onClick={() => router.back()} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại
                    </Button>
                    <Button asChild>
                        <Link href="/" className="gap-2">
                            <Home className="h-4 w-4" />
                            Trang chủ
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
