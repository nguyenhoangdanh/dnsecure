"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from "./theme-toggle"
import { UserNav } from "./user-nav"

const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Sản phẩm", href: "/products" },
    { name: "Dịch vụ", href: "/services" },
    { name: "Giới thiệu", href: "/about" },
    { name: "Liên hệ", href: "/contact" },
]

export function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <header
            className={cn(
                "sticky top-0 z-50 w-full transition-all duration-200",
                isScrolled
                    ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                    : "bg-background"
            )}
        >
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-6 lg:gap-10">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="inline-block h-8 w-8 rounded-lg bg-primary"></span>
                        <span className="text-xl font-bold">Brand</span>
                    </Link>

                    <nav className="hidden gap-6 md:flex">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <UserNav />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-background md:hidden">
                    <div className="container flex h-16 items-center justify-between px-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="inline-block h-8 w-8 rounded-lg bg-primary"></span>
                            <span className="text-xl font-bold">Brand</span>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close menu</span>
                        </Button>
                    </div>
                    <nav className="container mt-8 flex flex-col gap-4 px-4">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "text-lg font-medium transition-colors hover:text-primary",
                                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    )
}
