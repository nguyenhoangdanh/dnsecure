import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TestimonialsSection() {
    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="px-4 md:px-6">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Đánh giá</div>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Khách hàng nói gì về chúng tôi</h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Hàng ngàn khách hàng đã tin tưởng và hài lòng với dịch vụ của chúng tôi.
                        </p>
                    </div>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-0 shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <Avatar>
                                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                                    <CardDescription>{testimonial.title}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{testimonial.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

const testimonials = [
    {
        name: "Nguyễn Văn A",
        title: "CEO, Công ty ABC",
        content: "Chúng tôi đã sử dụng dịch vụ của họ trong hơn 2 năm và rất hài lòng với chất lượng và sự chuyên nghiệp.",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        name: "Trần Thị B",
        title: "Marketing Manager, XYZ Corp",
        content:
            "Giải pháp của họ đã giúp chúng tôi tăng doanh số bán hàng lên 30% chỉ trong vòng 3 tháng. Thực sự ấn tượng!",
        avatar: "/placeholder.svg?height=40&width=40",
    },
    {
        name: "Lê Văn C",
        title: "CTO, Startup DEF",
        content:
            "Đội ngũ hỗ trợ kỹ thuật luôn sẵn sàng giúp đỡ và giải quyết vấn đề nhanh chóng. Tôi rất hài lòng với dịch vụ.",
        avatar: "/placeholder.svg?height=40&width=40",
    },
]
