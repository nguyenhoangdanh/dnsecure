"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    LoadingButton,
    LoadingDots,
    LoadingIcon,
    LoadingOverlay,
    LoadingSpinner,
    LoadingWrapper,
    SkeletonCard,
    SkeletonTable,
    useLoading,
    useLoadingState,
} from "@/components/loading"

export default function LoadingDemoPage() {
    const { showLoading, hideLoading } = useLoading()
    const { isLoading, startLoading, stopLoading } = useLoadingState("component")
    const [isButtonLoading, setIsButtonLoading] = useState(false)
    const [isComponentLoading, setIsComponentLoading] = useState(false)

    const handleFullscreenLoading = () => {
        showLoading("fullscreen", "Đang xử lý dữ liệu...")
        setTimeout(() => {
            hideLoading()
        }, 3000)
    }

    const handlePageLoading = () => {
        showLoading("page", "Đang tải trang...")
        setTimeout(() => {
            hideLoading()
        }, 3000)
    }

    const handleComponentLoading = () => {
        startLoading("Đang tải component...")
        setTimeout(() => {
            stopLoading()
        }, 3000)
    }

    const handleButtonLoading = () => {
        setIsButtonLoading(true)
        setTimeout(() => {
            setIsButtonLoading(false)
        }, 3000)
    }

    const handleWrapperLoading = () => {
        setIsComponentLoading(true)
        setTimeout(() => {
            setIsComponentLoading(false)
        }, 3000)
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-6 text-3xl font-bold">Demo Loading Components</h1>

            <Tabs defaultValue="spinners" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="spinners">Spinners</TabsTrigger>
                    <TabsTrigger value="icons">Lucide Icons</TabsTrigger>
                    <TabsTrigger value="overlays">Overlays</TabsTrigger>
                    <TabsTrigger value="buttons">Buttons</TabsTrigger>
                    <TabsTrigger value="skeletons">Skeletons</TabsTrigger>
                    <TabsTrigger value="wrappers">Wrappers</TabsTrigger>
                </TabsList>

                <TabsContent value="spinners" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading Spinners</CardTitle>
                            <CardDescription>Các loại spinner khác nhau với kích thước và màu sắc tùy chỉnh</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Spinner</h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <LoadingSpinner size="sm" variant="primary" />
                                        <LoadingSpinner size="md" variant="secondary" />
                                        <LoadingSpinner size="lg" variant="success" />
                                        <LoadingSpinner size="xl" variant="danger" />
                                        <LoadingSpinner size="xl" variant="warning" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Dots</h3>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <LoadingDots size="sm" variant="primary" />
                                        <LoadingDots size="md" variant="secondary" />
                                        <LoadingDots size="lg" variant="success" />
                                        <LoadingDots size="lg" variant="danger" />
                                        <LoadingDots size="lg" variant="warning" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="icons" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lucide Icons</CardTitle>
                            <CardDescription>Sử dụng các biểu tượng từ Lucide làm loading indicator</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Các loại biểu tượng</h3>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="loader" size="md" variant="primary" />
                                            <span className="text-xs">loader</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="loader2" size="md" variant="secondary" />
                                            <span className="text-xs">loader2</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="refreshCw" size="md" variant="success" />
                                            <span className="text-xs">refreshCw</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="rotateCw" size="md" variant="danger" />
                                            <span className="text-xs">rotateCw</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="hourglass" size="md" variant="warning" />
                                            <span className="text-xs">hourglass</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="compass" size="md" variant="primary" />
                                            <span className="text-xs">compass</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Kích thước</h3>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="loader2" size="sm" variant="primary" />
                                            <span className="text-xs">sm</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="loader2" size="md" variant="primary" />
                                            <span className="text-xs">md</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="loader2" size="lg" variant="primary" />
                                            <span className="text-xs">lg</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <LoadingIcon icon="loader2" size="xl" variant="primary" />
                                            <span className="text-xs">xl</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="overlays" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading Overlays</CardTitle>
                            <CardDescription>Các loại overlay loading khác nhau</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <Button onClick={handleFullscreenLoading}>Fullscreen Loading</Button>
                                <Button onClick={handlePageLoading}>Page Loading</Button>
                                <Button onClick={handleComponentLoading}>Component Loading</Button>
                            </div>

                            <div className="relative mt-8 h-64 rounded-lg border p-4">
                                <h3 className="mb-4 text-lg font-medium">Component với Loading Overlay</h3>
                                <p>Nội dung của component sẽ bị che khi loading được kích hoạt.</p>
                                <LoadingOverlay spinnerVariant="icon" iconType="refreshCw">
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <div className="rounded-md bg-muted p-4">Panel 1</div>
                                        <div className="rounded-md bg-muted p-4">Panel 2</div>
                                        <div className="rounded-md bg-muted p-4">Panel 3</div>
                                        <div className="rounded-md bg-muted p-4">Panel 4</div>
                                    </div>
                                </LoadingOverlay>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="buttons" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading Buttons</CardTitle>
                            <CardDescription>Các loại button với trạng thái loading</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Button với Spinner</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <LoadingButton isLoading={isButtonLoading} onClick={handleButtonLoading}>
                                            Click để Loading
                                        </LoadingButton>
                                        <LoadingButton
                                            isLoading={isButtonLoading}
                                            variant="secondary"
                                            spinnerVariant="spinner"
                                            onClick={handleButtonLoading}
                                        >
                                            Secondary Button
                                        </LoadingButton>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Button với Dots</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <LoadingButton isLoading={isButtonLoading} spinnerVariant="dots" onClick={handleButtonLoading}>
                                            Click để Loading
                                        </LoadingButton>
                                        <LoadingButton
                                            isLoading={isButtonLoading}
                                            variant="outline"
                                            spinnerVariant="dots"
                                            onClick={handleButtonLoading}
                                        >
                                            Outline Button
                                        </LoadingButton>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Button với Lucide Icon</h3>
                                    <div className="flex flex-wrap gap-4">
                                        <LoadingButton
                                            isLoading={isButtonLoading}
                                            spinnerVariant="icon"
                                            iconType="loader2"
                                            onClick={handleButtonLoading}
                                        >
                                            Loader2 Icon
                                        </LoadingButton>
                                        <LoadingButton
                                            isLoading={isButtonLoading}
                                            variant="destructive"
                                            spinnerVariant="icon"
                                            iconType="refreshCw"
                                            onClick={handleButtonLoading}
                                        >
                                            RefreshCw Icon
                                        </LoadingButton>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="skeletons" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Skeleton Loaders</CardTitle>
                            <CardDescription>Các loại skeleton loader cho các component khác nhau</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Skeleton Table</h3>
                                    <SkeletonTable rows={3} columns={4} />
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Skeleton Cards</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <SkeletonCard />
                                        <SkeletonCard hasFooter={true} contentItems={2} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="wrappers" className="space-y-4 py-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading Wrappers</CardTitle>
                            <CardDescription>Bọc component với loading state</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <Button onClick={handleWrapperLoading}>Toggle Loading Wrapper</Button>

                                <LoadingWrapper
                                    isLoading={isComponentLoading}
                                    spinnerVariant="icon"
                                    iconType="hourglass"
                                    spinnerSize="lg"
                                    minHeight="200px"
                                >
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Card 1</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Nội dung card 1</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Card 2</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Nội dung card 2</p>
                                            </CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Card 3</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p>Nội dung card 3</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </LoadingWrapper>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
