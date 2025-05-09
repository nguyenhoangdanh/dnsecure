import React from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { LoadingPulse } from "./loading-pulse"

interface SkeletonCardProps {
    hasHeader?: boolean
    hasFooter?: boolean
    headerHeight?: string
    contentItems?: number
    contentItemHeight?: string
    footerHeight?: string
}

export const SkeletonCard = React.memo(function SkeletonCard({
    hasHeader = true,
    hasFooter = false,
    headerHeight = "h-8",
    contentItems = 3,
    contentItemHeight = "h-4",
    footerHeight = "h-10",
}: SkeletonCardProps) {
    return (
        <Card>
            {hasHeader && (
                <CardHeader>
                    <LoadingPulse height={headerHeight} width="w-3/4" />
                    <LoadingPulse height="h-4" width="w-full" />
                </CardHeader>
            )}
            <CardContent className="space-y-2">
                {Array.from({ length: contentItems }).map((_, index) => (
                    <LoadingPulse key={index} height={contentItemHeight} width={`w-${Math.floor(Math.random() * 4) + 7}/12`} />
                ))}
            </CardContent>
            {hasFooter && (
                <CardFooter>
                    <LoadingPulse height={footerHeight} width="w-full" />
                </CardFooter>
            )}
        </Card>
    )
})
