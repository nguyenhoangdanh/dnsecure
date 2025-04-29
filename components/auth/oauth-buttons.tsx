"use client"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface OAuthButtonsProps {
    isLoading?: boolean
}

export function OAuthButtons({ isLoading = false }: OAuthButtonsProps) {
    const handleOAuthLogin = (provider: string) => {
        window.location.href = `http://localhost:8000/api/v1/auth/${provider}`
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuthLogin("google")}>
                <Icons.google className="mr-2 h-4 w-4" />
                Google
            </Button>
            <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuthLogin("facebook")}>
                <Icons.facebook className="mr-2 h-4 w-4" />
                Facebook
            </Button>
            <Button variant="outline" type="button" disabled={isLoading} onClick={() => handleOAuthLogin("github")}>
                <Icons.github className="mr-2 h-4 w-4" />
                GitHub
            </Button>
        </div>
    )
}
