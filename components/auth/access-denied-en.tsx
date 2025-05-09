"use client"

import { AlertTriangle, ArrowLeft, ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AccessDeniedProps {
    requiredRoles: string[]
    userRoles: string[]
}

export function AccessDeniedEn({ requiredRoles, userRoles }: AccessDeniedProps) {
    const router = useRouter()

    const formatRoleName = (role: string) => {
        return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, " ")
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center p-4">
            <Card className="mx-auto max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                        <ShieldOff className="h-8 w-8 text-destructive" />
                    </div>
                    <CardTitle className="text-xl text-destructive">Access Denied</CardTitle>
                    <CardDescription>You don't have permission to access this page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Insufficient Permissions</AlertTitle>
                        <AlertDescription>
                            Your account doesn't have the necessary permissions to access this page.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2 rounded-lg bg-muted p-4">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Required roles:</p>
                            <div className="flex flex-wrap gap-1">
                                {requiredRoles.map((role) => (
                                    <Badge key={role} variant="outline" className="bg-primary/10">
                                        {formatRoleName(role)}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1 pt-2">
                            <p className="text-xs font-medium text-muted-foreground">Your current roles:</p>
                            <div className="flex flex-wrap gap-1">
                                {userRoles.length > 0 ? (
                                    userRoles.map((role) => (
                                        <Badge key={role} variant="outline">
                                            {formatRoleName(role)}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-xs text-muted-foreground">No roles assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <Button className="w-full" onClick={() => router.push("/")}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => router.push("/support")}>
                        Contact Support
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
