"use server"

import { db } from "@/lib/db"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import type { SessionState } from "@/lib/types/auth"

// Helper to get session expiration time (24 hours from now)
const getExpirationTime = () => {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)
  return expiresAt
}

export async function createSession(userId: string, deviceInfo?: any) {
  try {
    // Create a new session token
    const token = uuidv4()
    const expiresAt = getExpirationTime()

    // Create or get device
    let deviceId: string | null = null

    if (deviceInfo) {
      const device = await db.device.upsert({
        where: {
          id: deviceInfo.deviceId || "unknown",
        },
        update: {
          lastActive: new Date(),
          deviceType: deviceInfo.deviceType || "unknown",
          deviceName: deviceInfo.deviceName,
          browserInfo: deviceInfo.browserInfo,
          osInfo: deviceInfo.osInfo,
          ipAddress: deviceInfo.ipAddress,
        },
        create: {
          userId,
          deviceType: deviceInfo.deviceType || "unknown",
          deviceName: deviceInfo.deviceName,
          deviceId: deviceInfo.deviceId,
          browserInfo: deviceInfo.browserInfo,
          osInfo: deviceInfo.osInfo,
          ipAddress: deviceInfo.ipAddress,
        },
      })

      deviceId = device.id
    }

    // Create the session
    const session = await db.session.create({
      data: {
        userId,
        deviceId,
        token,
        expiresAt,
        ipAddress: deviceInfo?.ipAddress,
      },
    })

    // Set the session token in a cookie
   // Set the session token in a cookie
   const cookieStore = cookies()
   cookieStore.set("session_token", token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "lax",
     expires: expiresAt,
     path: "/",
   })

    return {
      success: true,
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
        deviceInfo: deviceInfo
          ? {
              deviceId: deviceInfo.deviceId,
              deviceType: deviceInfo.deviceType,
              browserInfo: deviceInfo.browserInfo,
              osInfo: deviceInfo.osInfo,
              ipAddress: deviceInfo.ipAddress,
            }
          : undefined,
      } as SessionState,
    }
  } catch (error) {
    console.error("Create session error:", error)
    return { success: false, error: "Failed to create session" }
  }
}

export async function refreshSession(sessionId: string) {
  try {
    // Get the current session
    const currentSession = await db.session.findUnique({
      where: { id: sessionId },
    })

    if (!currentSession || !currentSession.isActive) {
      return { success: false, error: "Session not found or inactive" }
    }

    // Update the session expiration
    const expiresAt = getExpirationTime()

    const updatedSession = await db.session.update({
      where: { id: sessionId },
      data: {
        expiresAt,
        lastUsedAt: new Date(),
      },
    })

    // Update the cookie
    const cookieStore = cookies()
    cookieStore.set("session_token", currentSession.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    })
    return {
      success: true,
      session: {
        id: updatedSession.id,
        token: updatedSession.token,
        expiresAt: updatedSession.expiresAt,
        isActive: updatedSession.isActive,
      },
    }
  } catch (error) {
    console.error("Refresh session error:", error)
    return { success: false, error: "Failed to refresh session" }
  }
}

export async function invalidateSession(sessionId: string) {
  try {
    // Deactivate the session
    await db.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    })

    // Remove the session cookie
    const cookieStore = cookies()
    cookieStore.delete("session_token")

    return { success: true }
  } catch (error) {
    console.error("Invalidate session error:", error)
    return { success: false, error: "Failed to invalidate session" }
  }
}

export async function getSessionFromToken(token: string) {
  try {
    const session = await db.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            isVerified: true,
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
        },
      },
    })

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return { success: false, error: "Session not found, inactive, or expired" }
    }

    // Extract roles and permissions
    const roles = session.user.userRoles.map((ur:any) => ur.role.name)
    const permissions = session.user.userRoles.flatMap((ur:any) => ur.role.permissions.map((p) => p.name))

    return {
      success: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        isVerified: session.user.isVerified,
        roles,
        permissions,
        sessionId: session.id,
      },
      session: {
        id: session.id,
        token: session.token,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      },
    }
  } catch (error) {
    console.error("Get session error:", error)
    return { success: false, error: "Failed to get session" }
  }
}
