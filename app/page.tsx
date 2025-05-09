import { CtaSection } from "@/components/client/cta-section";
import { FeaturesSection } from "@/components/client/features-section";
import { Footer } from "@/components/client/footer";
import { Header } from "@/components/client/header";
import { HeroSection } from "@/components/client/hero-section";
import { TestimonialsSection } from "@/components/client/testimonials-section";

export default function Home() {
    return (
        <div className="flex w-full min-h-screen flex-col">
            <Header />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <TestimonialsSection />
                <CtaSection />
            </main>
            <Footer />
        </div>
    )
}
