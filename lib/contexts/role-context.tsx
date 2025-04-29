"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import type { RoleWithPermissions } from "@/lib/types/auth"
import { getUserRoles } from "../actions/role-action"

interface RoleContextType {
    roles: RoleWithPermissions[]
    loading: boolean
    hasRole: (roleName: string) => boolean
    getRolePermissions: (roleName: string) => string[]
    refreshRoles: () => Promise<void>
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const { user, status } = useAuth()
    const [roles, setRoles] = useState<RoleWithPermissions[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    // Load roles when user is authenticated
    useEffect(() => {
        if (status === "authenticated" && user) {
            loadUserRoles(user.id)
        } else if (status === "unauthenticated") {
            setRoles([])
            setLoading(false)
        }
    }, [user, status])

    const loadUserRoles = async (userId: string) => {
        setLoading(true)
        try {
            const result = await getUserRoles(userId)
            if (result.success && result.roles) {
                setRoles(result.roles)
            } else {
                setRoles([])
            }
        } catch (error) {
            console.error("Failed to load user roles:", error)
            setRoles([])
        } finally {
            setLoading(false)
        }
    }

    const hasRole = (roleName: string) => {
        return roles.some((role) => role.name === roleName)
    }

    const getRolePermissions = (roleName: string) => {
        const role = roles.find((r) => r.name === roleName)
        if (!role) return []
        return role.permissions.map((p) => p.name)
    }

    const refreshRoles = async () => {
        if (user) {
            await loadUserRoles(user.id)
        }
    }

    return (
        <RoleContext.Provider
            value={{
                roles,
                loading,
                hasRole,
                getRolePermissions,
                refreshRoles,
            }}
        >
            {children}
        </RoleContext.Provider>
    )
}

export const useRole = () => {
    const context = useContext(RoleContext)
    if (context === undefined) {
        throw new Error("useRole must be used within a RoleProvider")
    }
    return context
}
