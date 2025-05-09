// In oauth-buttons.tsx
"use client"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { SocialButton } from "../ui/social-button"
import { useState } from "react"
import { MagicLinkIcon } from "./magic-link-icon"
import { AnimatedIcons } from "../animated-icons"
import { useRouter } from "next/navigation"

interface OAuthButtonsProps {
    isLoading?: boolean
}

export function OAuthButtons({ isLoading = false }: OAuthButtonsProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api";
    const router = useRouter();
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null)
    const handleOAuthLogin = (provider: string) => {
        setLoadingProvider(provider)
        // Get current URL to use as callback
        const currentUrl = encodeURIComponent(window.location.origin + '/auth/callback')

        // Redirect to OAuth endpoint with callback URL
        window.location.href = `${API_URL}/auth/${provider}?callbackUrl=${currentUrl}`
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            <SocialButton
                variant="magic"
                type="button"
                disabled={isLoading || loadingProvider !== null}
                isLoading={loadingProvider === "magic"}
                renderIcon={(isHovered) => <AnimatedIcons.magic isHovered={isHovered} />}
                onClick={() => router.push('magic-link')}
            >
                <span className="ml-1">Magic Link</span>
            </SocialButton>
            <SocialButton
                variant="google"
                type="button"
                disabled={isLoading || loadingProvider !== null}
                isLoading={loadingProvider === "google"}
                renderIcon={(isHovered) => <AnimatedIcons.google isHovered={isHovered} />}
                onClick={() => handleOAuthLogin("google")}
            >
                <span className="ml-1">Google</span>
            </SocialButton>

            <SocialButton
                variant="github"
                type="button"
                disabled={isLoading || loadingProvider !== null}
                isLoading={loadingProvider === "github"}
                renderIcon={(isHovered) => <AnimatedIcons.github isHovered={isHovered} />}
                onClick={() => handleOAuthLogin("github")}
            >
                <span className="ml-1">GitHub</span>
            </SocialButton>

            <SocialButton
                variant="facebook"
                type="button"
                disabled={isLoading || loadingProvider !== null}
                isLoading={loadingProvider === "facebook"}
                renderIcon={(isHovered) => <AnimatedIcons.facebook isHovered={isHovered} />}
                onClick={() => handleOAuthLogin("facebook")}
            >
                <span className="ml-1">Facebook</span>
            </SocialButton>

        </div>
    )
}