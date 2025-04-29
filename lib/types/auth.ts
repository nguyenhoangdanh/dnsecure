export interface User {
    id: string
    email: string
    fullName: string
    emailVerified: boolean
    roles: string[]
    avatarUrl?: string
  }
  
  export interface AuthState {
    user: User | null
    accessToken: string | null
    expiresAt: Date | null
    status: "loading" | "authenticated" | "unauthenticated"
  }
  
  export interface LoginCredentials {
    email: string
    password: string
  }
  
  export interface RegisterCredentials {
    email: string
    password: string
    fullName: string
  }
  
  export interface AuthResponse {
    user: User
    accessToken: string
    expiresAt: Date
  }
  
  export interface ApiResponse<T = any> {
    success: boolean
    message?: string
    data?: T
    error?: string
  }
  
  export interface RoleWithPermissions {
    id: string
    name: string
    description: string
    permissions: {
      id: string
      name: string
      description: string
    }[]
  }
  
  export interface SessionState {
    id: string
    token: string
    expiresAt: Date
    isActive: boolean
    deviceInfo?: {
      deviceId: string
      deviceType: string
      browserInfo: string
      osInfo: string
      ipAddress: string
    }
  }
  