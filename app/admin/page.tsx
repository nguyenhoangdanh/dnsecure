import { AnalyticsChart } from "@/components/admin/analytics-chart";
import { DashboardCards } from "@/components/admin/dashboard-cards";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { RecentActivity } from "@/components/admin/recent-activity";


export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <DashboardHeader />
            <DashboardCards />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <AnalyticsChart />
                <RecentActivity />
            </div>
        </div>
    )
}


// "use client"

// import AuthGuard from "@/components/auth-guard"
// import { Button } from "@/components/ui/button"
// import Link from "next/link"

// export default function AdminPage() {
//     return (
//         <AuthGuard
//             requiredRoles={["admin"]}
//             // fallback={
//             //     <div className="container py-10">
//             //         <div className="flex flex-col items-center justify-center space-y-4">
//             //             <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
//             //             <p>You need admin privileges to access this page.</p>
//             //             <Button asChild>
//             //                 <Link href="/dashboard">Back to Dashboard</Link>
//             //             </Button>
//             //         </div>
//             //     </div>
//             // }
//         >
//             <div className="container py-10">
//                 <div className="flex flex-col items-center justify-center space-y-4">
//                     <h1 className="text-3xl font-bold">Admin Dashboard</h1>
//                     <p className="text-muted-foreground">Welcome to the admin area!</p>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
//                         <div className="bg-muted p-6 rounded-md">
//                             <h2 className="text-xl font-semibold mb-2">User Management</h2>
//                             <p className="text-sm text-muted-foreground mb-4">Manage users, roles, and permissions</p>
//                             <Button asChild variant="outline">
//                                 <Link href="/admin/users">Manage Users</Link>
//                             </Button>
//                         </div>

//                         <div className="bg-muted p-6 rounded-md">
//                             <h2 className="text-xl font-semibold mb-2">System Settings</h2>
//                             <p className="text-sm text-muted-foreground mb-4">Configure system settings and preferences</p>
//                             <Button asChild variant="outline">
//                                 <Link href="/admin/settings">System Settings</Link>
//                             </Button>
//                         </div>
//                     </div>

//                     <Button asChild className="mt-6">
//                         <Link href="/dashboard">Back to Dashboard</Link>
//                     </Button>
//                 </div>
//             </div>
//         </AuthGuard>
//     )
// }
