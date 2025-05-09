import Link from "next/link"
import { MagicLinkForm } from "@/components/magic-link-form"

export default function MagicLinkPage() {
    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                <div className="flex flex-col space-y-2 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight">Magic Link</h1>
                    <p className="text-sm text-muted-foreground">
                        Enter your email address and we'll send you a magic link to sign in
                    </p>
                </div>
                <MagicLinkForm />
                <p className="px-8 text-center text-sm text-muted-foreground">
                    <Link href="/login" className="hover:text-brand underline underline-offset-4">
                        Back to login
                    </Link>
                </p>
            </div>
        </div>
    )
}
