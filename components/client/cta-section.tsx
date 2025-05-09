import { Button } from "@/components/ui/button"
import Link from "next/link"

export function CtaSection() {
    return (
        <section className="w-full bg-primary py-12 md:py-24 lg:py-32">
            <div className="px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground md:text-4xl">
                            Sẵn sàng bắt đầu?
                        </h2>
                        <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                            Hãy liên hệ với chúng tôi ngay hôm nay để được tư vấn miễn phí và nhận báo giá chi tiết cho dự án của bạn.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/contact">Liên hệ ngay</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground" asChild>
                            <Link href="/services">Tìm hiểu thêm</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
