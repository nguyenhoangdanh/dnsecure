import { Button } from "@/components/ui/button"
import Link from "next/link"

export function HeroSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
            <div className="px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                Giải pháp tốt nhất cho doanh nghiệp của bạn
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                Chúng tôi cung cấp các giải pháp công nghệ hiện đại giúp doanh nghiệp của bạn phát triển nhanh chóng và
                                bền vững.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Button size="lg" asChild>
                                <Link href="/contact">Liên hệ ngay</Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/services">Xem dịch vụ</Link>
                            </Button>
                        </div>
                    </div>
                    <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last">
                        <img
                            alt="Hero"
                            className="h-full w-full object-cover"
                            src="/placeholder.svg?height=720&width=1280"
                            width="1280"
                            height="720"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
