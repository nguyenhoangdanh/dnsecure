"use client"

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthFallback } from './auth/auth-fallback'
import { AccessDenied } from './auth/access-denied'
import { useAuth } from '@/hooks'

interface AuthGuardProps {
    children: ReactNode
    requiredRoles?: string[]
    requiredPermissions?: string[]
    requiresRecentLogin?: boolean
    fallback?: ReactNode
    accessDeniedComponent?: ReactNode
}

export default function AuthGuard({
    children,
    requiredRoles = [],
    requiredPermissions = [],
    requiresRecentLogin = false,
    fallback,
    accessDeniedComponent
}: AuthGuardProps) {
    const { user, status, isAuthenticated, refreshToken } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isVerifying, setIsVerifying] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);

    useEffect(() => {
        const verifyAccess = async () => {
            // Still loading auth state
            if (status === 'loading') {
                return;
            }

            // Not authenticated, redirect to login
            if (!isAuthenticated) {
                const callbackUrl = encodeURIComponent(pathname);
                router.push(`/login?callbackUrl=${callbackUrl}`);
                return;
            }

            // Try to refresh token if needed
            if (status === 'refresh_needed') {
                await refreshToken();
                // Continue verification after refresh attempt
            }

            // Check for required roles
            if (requiredRoles.length > 0 && user) {
                const hasRequiredRole = requiredRoles.some(role =>
                    user.roles && user.roles.includes(role)
                );

                if (!hasRequiredRole) {
                    setAccessDeniedReason('insufficient_role');
                    setHasAccess(false);
                    setIsVerifying(false);
                    return;
                }
            }

            // Check for required permissions
            if (requiredPermissions.length > 0 && user) {
                // Get user permissions, defaulting to empty array if not present
                const userPermissions = user.permissions || [];

                const hasRequiredPermissions = requiredPermissions.every(
                    permission => userPermissions.includes(permission)
                );

                if (!hasRequiredPermissions) {
                    setAccessDeniedReason('insufficient_permissions');
                    setHasAccess(false);
                    setIsVerifying(false);
                    return;
                }
            }

            // Check for recent login requirement (for sensitive operations)
            if (requiresRecentLogin) {
                const lastLoginTime = localStorage.getItem('lastLoginTime');
                const wasRecentlyLoggedIn = lastLoginTime
                    ? (Date.now() - new Date(lastLoginTime).getTime()) < 15 * 60 * 1000 // 15 minutes
                    : false;

                if (!wasRecentlyLoggedIn) {
                    // Redirect to re-authentication page
                    router.push(`/confirm-identity?callbackUrl=${encodeURIComponent(pathname)}`);
                    return;
                }
            }

            // All checks passed
            setHasAccess(true);
            setIsVerifying(false);
        };
        verifyAccess();
    }, [user, status, isAuthenticated, refreshToken, router, pathname, requiredRoles, requiredPermissions, requiresRecentLogin]);

    // Show loading state while verifying
    if (isVerifying) {
        return fallback || <AuthFallback />;
    }

    // Show access denied if user doesn't have permissions
    if (!hasAccess) {
        return accessDeniedComponent || (
            <AccessDenied
                requiredRoles={requiredRoles}
                userRoles={user?.roles || []}
                requiredPermissions={requiredPermissions || []}
                userPermissions={user?.permissions || []}
                reason={accessDeniedReason}
            />
        );
    }

    // User is authenticated and has required permissions
    return <>{children}</>;
}

// // components/auth-guard.tsx
// "use client"

// import { ReactNode, useEffect, useState } from 'react'
// import { useRouter, usePathname } from 'next/navigation'
// import { api } from '@/lib/api/api-client'
// import { AuthFallback } from './auth/auth-fallback'
// import { AccessDenied } from './auth/access-denied'
// import { useAuth } from '@/hooks'

// interface AuthGuardProps {
//     children: ReactNode
//     requiredRoles?: string[]
//     fallback?: ReactNode
//     accessDeniedComponent?: ReactNode
// }

// export default function AuthGuard({ children, requiredRoles = [], fallback, accessDeniedComponent }: AuthGuardProps) {
//     const { user, status, isAuthenticated } = useAuth()
//     const router = useRouter()
//     const pathname = usePathname()
//     const [isVerifying, setIsVerifying] = useState(true);

//     useEffect(() => {
//         if (status === 'loading') {
//             // Still loading, wait
//             return;
//         }

//         if (!isAuthenticated) {
//             // Not authenticated, redirect to login
//             router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
//             return;
//         }

//         // Auth check complete
//         setIsVerifying(false);
//     }, [user, status, isAuthenticated, router, pathname]);


//     // useEffect(() => {
//     //     async function verifyAuth() {
//     //         if (status === 'authenticated' && user) {
//     //             // Already logged in
//     //             setIsVerifying(false)
//     //             return
//     //         }

//     //         try {
//     //             // Try to check auth status
//     //             const response = await api.get('/auth/me')

//     //             if (response.success && response.data) {
//     //                 // User is authenticated, update auth context
//     //                 await refreshUser()
//     //                 setIsVerifying(false)
//     //             } else {
//     //                 // Not authenticated, try refresh token
//     //                 try {
//     //                     const refreshResponse = await api.post('/auth/refresh', {})

//     //                     if (refreshResponse.success) {
//     //                         // Successfully refreshed token
//     //                         await refreshUser()
//     //                         setIsVerifying(false)
//     //                     } else {
//     //                         // Refresh failed, redirect to login
//     //                         router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
//     //                     }
//     //                 } catch (refreshError) {
//     //                     // Refresh failed
//     //                     router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
//     //                 }
//     //             }
//     //         } catch (error) {
//     //             // Auth check failed
//     //             router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
//     //         }
//     //     }

//     //     verifyAuth()
//     // }, [user, status, refreshUser, router, pathname])

//     // Show loading state while verifying
//     if (isVerifying) {
//         return fallback || <AuthFallback />
//     }

//     // If we have required roles, check if user has them
//     if (requiredRoles.length > 0 && user) {
//         const hasRequiredRole = requiredRoles.some(role =>
//             user.roles && user.roles.includes(role)
//         )

//         if (!hasRequiredRole) {
//             // User doesn't have required role
//             return accessDeniedComponent || <AccessDenied requiredRoles={requiredRoles} userRoles={user.roles || []} />
//         }
//     }

//     // User is authenticated, render children
//     return <>{children}</>
// }