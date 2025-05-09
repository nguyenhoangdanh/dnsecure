import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react'

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="px-4 py-12 md:px-6">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="inline-block h-8 w-8 rounded-lg bg-primary"></span>
                            <span className="text-xl font-bold">Brand</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Công ty chúng tôi cung cấp các giải pháp tốt nhất cho khách hàng, với sự tận tâm và chuyên nghiệp.
                        </p>
                        <div className="mt-6 flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary">
                                <Youtube className="h-5 w-5" />
                                <span className="sr-only">YouTube</span>
                            </Link>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Liên kết nhanh</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary">
                                    Sản phẩm
                                </Link>
                            </li>
                            <li>
                                <Link href="/services" className="text-sm text-muted-foreground hover:text-primary">
                                    Dịch vụ
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                                    Giới thiệu
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Dịch vụ</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Thiết kế website
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Phát triển ứng dụng
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Tư vấn giải pháp
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Hỗ trợ kỹ thuật
                                </Link>
                            </li>
                            <li>
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Đào tạo
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-medium">Liên hệ</h3>
                        <ul className="mt-4 space-y-2">
                            <li className="text-sm text-muted-foreground">
                                <strong>Địa chỉ:</strong> 123 Đường ABC, Quận XYZ, TP. HCM
                            </li>
                            <li className="text-sm text-muted-foreground">
                                <strong>Điện thoại:</strong> (028) 1234 5678
                            </li>
                            <li className="text-sm text-muted-foreground">
                                <strong>Email:</strong> info@example.com
                            </li>
                            <li className="text-sm text-muted-foreground">
                                <strong>Giờ làm việc:</strong> 8:00 - 17:30, Thứ 2 - Thứ 6
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t pt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Brand. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    )
}
