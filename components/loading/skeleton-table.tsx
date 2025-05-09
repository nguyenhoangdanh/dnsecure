import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LoadingPulse } from "./loading-pulse"

interface SkeletonTableProps {
    rows?: number
    columns?: number
    showHeader?: boolean
    cellHeight?: string
}

export const SkeletonTable = React.memo(function SkeletonTable({
    rows = 5,
    columns = 5,
    showHeader = true,
    cellHeight = "h-10",
}: SkeletonTableProps) {
    return (
        <div className="w-full rounded-md border">
            <Table>
                {showHeader && (
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columns }).map((_, index) => (
                                <TableHead key={index}>
                                    <LoadingPulse height="h-4" width="w-24" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                )}
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {Array.from({ length: columns }).map((_, colIndex) => (
                                <TableCell key={colIndex}>
                                    <LoadingPulse height={cellHeight} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
})
