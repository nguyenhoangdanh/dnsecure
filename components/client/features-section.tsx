import { CheckCircle2 } from "lucide-react"

export function FeaturesSection() {
    return (
        <section className="w-full bg-muted/40 py-12 md:py-24 lg:py-32">
            <div className="px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Tính năng</div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Tại sao chọn chúng tôi?</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Chúng tôi cung cấp các giải pháp toàn diện với nhiều tính năng vượt trội, đáp ứng mọi nhu cầu của doanh
                            nghiệp.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div key={feature.title} className="flex flex-col space-y-2 rounded-lg border p-6">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

const features = [
    {
        title: "Thiết kế hiện đại",
        description: "Giao diện người dùng hiện đại, thân thiện và dễ sử dụng trên mọi thiết bị.",
    },
    {
        title: "Hiệu suất cao",
        description: "Tối ưu hóa hiệu suất để đảm bảo tốc độ và trải nghiệm người dùng tốt nhất.",
    },
    {
        title: "Bảo mật tối đa",
        description: "Áp dụng các biện pháp bảo mật tiên tiến để bảo vệ dữ liệu của bạn.",
    },
    {
        title: "Hỗ trợ 24/7",
        description: "Đội ngũ hỗ trợ chuyên nghiệp, sẵn sàng giải đáp mọi thắc mắc của bạn.",
    },
    {
        title: "Tùy biến linh hoạt",
        description: "Dễ dàng tùy chỉnh theo nhu cầu cụ thể của doanh nghiệp bạn.",
    },
    {
        title: "Cập nhật thường xuyên",
        description: "Liên tục cập nhật tính năng mới và cải tiến hệ thống.",
    },
]
