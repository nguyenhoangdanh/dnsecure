import { LoadingSpinner } from "@/components/loading/loading-spinner";

export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="xl" variant="primary" />
                <p className="text-lg font-medium text-muted-foreground">Đang tải dữ liệu...</p>
            </div>
        </div>
    )
}
