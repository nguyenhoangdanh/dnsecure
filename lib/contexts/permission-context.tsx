"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useRole } from "./role-context"

interface PermissionContextType {
    hasPermission: (permissionName: string) => boolean
    hasAnyPermission: (permissionNames: string[]) => boolean
    hasAllPermissions: (permissionNames: string[]) => boolean
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
    const { roles, loading } = useRole()

    // Get all permissions from all roles
    const getAllPermissions = (): string[] => {
        if (loading) return []

        const allPermissions = new Set<string>()

        roles.forEach((role) => {
            role.permissions.forEach((permission) => {
                allPermissions.add(permission.name)
            })
        })

        return Array.from(allPermissions)
    }

    const hasPermission = (permissionName: string): boolean => {
        if (loading) return false

        const allPermissions = getAllPermissions()
        return allPermissions.includes(permissionName)
    }

    const hasAnyPermission = (permissionNames: string[]): boolean => {
        if (loading) return false

        const allPermissions = getAllPermissions()
        return permissionNames.some((permission) => allPermissions.includes(permission))
    }

    const hasAllPermissions = (permissionNames: string[]): boolean => {
        if (loading) return false

        const allPermissions = getAllPermissions()
        return permissionNames.every((permission) => allPermissions.includes(permission))
    }

    return (
        <PermissionContext.Provider
            value={{
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
            }}
        >
            {children}
        </PermissionContext.Provider>
    )
}

export const usePermission = () => {
    const context = useContext(PermissionContext)
    if (context === undefined) {
        throw new Error("usePermission must be used within a PermissionProvider")
    }
    return context
}
