"use client"

import { useToast } from "@/components/toast/toaster"
import { Button } from "@/components/ui/button"

export default function ToastDemo() {
    const { toast } = useToast()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8">
            <h1 className="text-3xl font-bold">Toast Notifications Demo</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                    onClick={() =>
                        toast({
                            title: "Default Toast",
                            description: "This is a default toast notification",
                        })
                    }
                >
                    Default Toast
                </Button>

                <Button
                    variant="destructive"
                    onClick={() =>
                        toast({
                            variant: "error",
                            title: "Error Toast",
                            description: "Something went wrong!",
                            duration: 5000,
                        })
                    }
                >
                    Error Toast
                </Button>

                <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() =>
                        toast({
                            variant: "success",
                            title: "Success Toast",
                            description: "Operation completed successfully!",
                            duration: 5000,
                        })
                    }
                >
                    Success Toast
                </Button>

                <Button
                    className="bg-yellow-600 hover:bg-yellow-700"
                    onClick={() =>
                        toast({
                            variant: "warning",
                            title: "Warning Toast",
                            description: "This action might cause issues.",
                            duration: 5000,
                        })
                    }
                >
                    Warning Toast
                </Button>

                <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() =>
                        toast({
                            variant: "info",
                            title: "Info Toast",
                            description: "Here's some information for you.",
                            duration: 5000,
                        })
                    }
                >
                    Info Toast
                </Button>

                <Button
                    variant="outline"
                    onClick={() =>
                        toast({
                            title: "Long Toast",
                            description:
                                "This toast has a longer description to demonstrate how multi-line toasts appear in the interface. It should wrap nicely and maintain proper spacing.",
                            duration: 8000,
                        })
                    }
                >
                    Long Toast
                </Button>

                <Button
                    variant="outline"
                    onClick={() => {
                        const id = toast({
                            title: "Loading...",
                            description: "Please wait while we process your request.",
                            duration: 0, // Infinite duration
                        })

                        // Simulate a loading operation
                        setTimeout(() => {
                            toast({
                                id,
                                variant: "success",
                                title: "Completed",
                                description: "Your request has been processed successfully!",
                                duration: 5000,
                            })
                        }, 3000)
                    }}
                >
                    Loading Toast
                </Button>

                <Button
                    variant="outline"
                    className="col-span-2 md:col-span-1"
                    onClick={() => {
                        // Show multiple toasts in sequence
                        toast({
                            variant: "info",
                            title: "Multiple Toasts",
                            description: "First toast message",
                            duration: 3000,
                        })

                        setTimeout(() => {
                            toast({
                                variant: "success",
                                title: "Multiple Toasts",
                                description: "Second toast message",
                                duration: 3000,
                            })
                        }, 1000)

                        setTimeout(() => {
                            toast({
                                variant: "warning",
                                title: "Multiple Toasts",
                                description: "Third toast message",
                                duration: 3000,
                            })
                        }, 2000)
                    }}
                >
                    Multiple Toasts
                </Button>
            </div>
        </div>
    )
}
