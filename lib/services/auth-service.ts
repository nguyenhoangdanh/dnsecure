import { api } from "../api/api-client"
import type { AuthResponse, LoginCredentials, RegisterCredentials, ApiResponse } from "../types/auth"

export const authService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>("/auth/login", credentials)
  },

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>("/auth/register", credentials)
  },

  async logout(): Promise<ApiResponse> {
    return api.post("/auth/logout", {})
  },

  async getCurrentUser(): Promise<ApiResponse<AuthResponse["user"]>> {
    return api.get<AuthResponse["user"]>("/auth/me")
  },

  async sendMagicLink(email: string): Promise<ApiResponse> {
    return api.post("/auth/magic-link", { email })
  },

  async verifyEmail(token: string): Promise<ApiResponse> {
    return api.get(`/auth/verify-email/${token}`)
  },

  async verifyMagicLink(token: string): Promise<ApiResponse<AuthResponse>> {
    return api.get(`/auth/verify-magic-link/${token}`)
  },

  // Helper methods for token management
  getStoredToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("accessToken")
  },

  setStoredToken(token: string, expiresAt: Date): void {
    if (typeof window === "undefined") return
    localStorage.setItem("accessToken", token)
    localStorage.setItem("tokenExpiresAt", expiresAt.toISOString())
  },

  clearStoredToken(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem("accessToken")
    localStorage.removeItem("tokenExpiresAt")
  },

  isTokenExpired(): boolean {
    if (typeof window === "undefined") return true

    const expiresAtStr = localStorage.getItem("tokenExpiresAt")
    if (!expiresAtStr) return true

    const expiresAt = new Date(expiresAtStr)
    return expiresAt <= new Date()
  },
}
