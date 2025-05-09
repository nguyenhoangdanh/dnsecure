"use server"

import { db } from "@/lib/db"
import type { RoleWithPermissions } from "@/lib/types/auth"

export async function getUserRoles(userId: string) {
  try {
    const userWithRoles = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    })

    if (!userWithRoles) {
      return { success: false, error: "User not found" }
    }

    const roles: RoleWithPermissions[] = userWithRoles.userRoles.map((userRole:any) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      description: userRole.role.description,
      permissions: userRole.role.permissions.map((permission:any) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
      })),
    }))

    return { success: true, roles }
  } catch (error) {
    console.error("Get user roles error:", error)
    return { success: false, error: "Failed to get user roles" }
  }
}

export async function assignRoleToUser(userId: string, roleName: string) {
  try {
    // Find the role by name
    const role = await db.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      return { success: false, error: "Role not found" }
    }

    // Check if the user already has this role
    const existingUserRole = await db.userRole.findFirst({
      where: {
        userId,
        roleId: role.id,
      },
    })

    if (existingUserRole) {
      return { success: true, message: "User already has this role" }
    }

    // Assign the role to the user
    await db.userRole.create({
      data: {
        userId,
        roleId: role.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Assign role error:", error)
    return { success: false, error: "Failed to assign role" }
  }
}

export async function removeRoleFromUser(userId: string, roleName: string) {
  try {
    // Find the role by name
    const role = await db.role.findUnique({
      where: { name: roleName },
    })

    if (!role) {
      return { success: false, error: "Role not found" }
    }

    // Remove the role from the user
    await db.userRole.deleteMany({
      where: {
        userId,
        roleId: role.id,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Remove role error:", error)
    return { success: false, error: "Failed to remove role" }
  }
}
