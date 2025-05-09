"use client"

import { Loader2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

export function AuthFallbackEn() {
    const [loadingText, setLoadingText] = useState("Authenticating...")
    const [showExtendedMessage, setShowExtendedMessage] = useState(false)

    // Change loading message after a period of time to improve UX
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setLoadingText("Checking login session...")
        }, 2000)

        const timer2 = setTimeout(() => {
            setLoadingText("Verifying access permissions...")
        }, 4000)

        const timer3 = setTimeout(() => {
            setShowExtendedMessage(true)
        }, 6000)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
            clearTimeout(timer3)
        }
    }, [])

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="mx-auto max-w-md text-center shadow-lg">
                <CardHeader className="pb-2">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Security Authentication</CardTitle>
                    <CardDescription>Please wait while we authenticate your session</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-sm font-medium">{loadingText}</p>
                        </div>

                        {showExtendedMessage && (
                            <div className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                                <p>This process is taking longer than expected.</p>
                                <p className="mt-2">
                                    If the page doesn't load in a few more seconds, please{" "}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="font-medium text-primary hover:underline"
                                    >
                                        refresh the page
                                    </button>
                                    .
                                </p>
                            </div>
                        )}

                        <div className="flex w-full justify-center space-x-1 pt-4">
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0.2s]"></div>
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0.4s]"></div>
                            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/60 [animation-delay:0.6s]"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
