// app/auth/magic-link/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAuth } from "@/hooks"

export default function MagicLinkPage() {
    const router = useRouter()
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams()
    const token = searchParams.get("token")
    const { isAuthenticated, verifyMagicLink, status: authStatus, error: authError } = useAuth()

    const [status, setStatus] = useState<"loading" | "error" | "success">("loading")
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        // If user is already authenticated, redirect to dashboard
        if (isAuthenticated) {
            router.push("/")
            return
        }

        // If no token is provided, show error
        if (!token) {
            setStatus("error")
            setErrorMessage("Invalid or missing token. Please request a new magic link.")
            return
        }

        // Use the Redux-based verifyMagicLink action
        dispatch(verifyMagicLink(token))

        // Monitor the status
        if (authStatus === 'authenticated') {
            setStatus("success")
            // Wait a bit and then redirect to dashboard
            setTimeout(() => {
                router.push("/")
            }, 3000)
        } else if (authError) {
            setStatus("error")
            setErrorMessage(authError || "Failed to verify magic link. Please try again.")
        }
    }, [token, router, isAuthenticated, status, authError])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Magic Link Verification
                    </h2>
                </div>

                <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {status === "loading" && (
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                            <p className="mt-4 text-gray-600">Verifying your magic link...</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <svg
                                    className="h-6 w-6 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                            <p className="mt-4 text-gray-600">
                                Successfully authenticated! Redirecting you to your dashboard...
                            </p>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <svg
                                    className="h-6 w-6 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <p className="mt-4 text-red-500">{errorMessage}</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => router.push("/auth/login")}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}



// // app/auth/magic-link/page.tsx
// "use client"

// import { useEffect, useState } from "react"
// import { useRouter, useSearchParams } from "next/navigation"
// import { useAuth } from "@/hooks"

// export default function MagicLinkPage() {
//     const router = useRouter()
//     const searchParams = useSearchParams()
//     const token = searchParams.get("token")
//     const { isAuthenticated, verifyMagicLink } = useAuth()

//     const [status, setStatus] = useState<"loading" | "error" | "success">("loading")
//     const [errorMessage, setErrorMessage] = useState<string>("")

//     useEffect(() => {
//         // If user is already authenticated, redirect to dashboard
//         if (isAuthenticated) {
//             router.push("/")
//             return
//         }

//         // If no token is provided, show error
//         if (!token) {
//             setStatus("error")
//             setErrorMessage("Invalid or missing token. Please request a new magic link.")
//             return
//         }

//         const verifyLink = async () => {
//             try {
//                 const response = await verifyMagicLink(token);

//                 if (response?.success) {
//                     setStatus("success")

//                     // Wait a bit and then redirect to dashboard
//                     setTimeout(() => {
//                         router.push("/")
//                     }, 10000)
//                 } else {
//                     setStatus("error")
//                     setErrorMessage(response.error || "Failed to verify magic link. Please try again.")
//                 }
//             } catch (error) {
//                 console.error("Magic link verification error:", error)
//                 setStatus("error")
//                 setErrorMessage("An unexpected error occurred. Please try again.")
//             }
//         }

//         verifyLink()
//     }, [token, router, isAuthenticated])

//     return (
//         <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
//             <div className="w-full max-w-md space-y-8">
//                 <div className="text-center">
//                     <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
//                         Magic Link Verification
//                     </h2>
//                 </div>

//                 <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
//                     {status === "loading" && (
//                         <div className="text-center">
//                             <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
//                             <p className="mt-4 text-gray-600">Verifying your magic link...</p>
//                         </div>
//                     )}

//                     {status === "success" && (
//                         <div className="text-center">
//                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
//                                 <svg
//                                     className="h-6 w-6 text-green-600"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M5 13l4 4L19 7"
//                                     />
//                                 </svg>
//                             </div>
//                             <p className="mt-4 text-gray-600">
//                                 Successfully authenticated! Redirecting you to your dashboard...
//                             </p>
//                         </div>
//                     )}

//                     {status === "error" && (
//                         <div className="text-center">
//                             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
//                                 <svg
//                                     className="h-6 w-6 text-red-600"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     viewBox="0 0 24 24"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                     <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M6 18L18 6M6 6l12 12"
//                                     />
//                                 </svg>
//                             </div>
//                             <p className="mt-4 text-red-500">{errorMessage}</p>
//                             <div className="mt-6">
//                                 <button
//                                     onClick={() => router.push("/auth/login")}
//                                     className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                                 >
//                                     Back to Login
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     )
// }