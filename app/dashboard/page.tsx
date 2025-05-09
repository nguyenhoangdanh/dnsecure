"use client"

import { Button } from "@/components/ui/button"
import AuthGuard from "@/components/auth-guard"
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <AuthGuard >
      <div className="container py-10">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user?.fullName || user?.email}!</p>

          <div className="bg-muted p-4 rounded-md w-full max-w-md">
            <h2 className="font-semibold mb-2">Your Roles:</h2>
            {user?.roles && user.roles.length > 0 ? (
              <ul className="list-disc list-inside">
                {user.roles.map((role) => (
                  <li key={role}>{role}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            )}
          </div>

          <Button onClick={() => logout()}>Logout</Button>
          <Button onClick={() => router.push('/admin')}>Go to Admin</Button>
        </div>
      </div>
    </AuthGuard>
  )
}
