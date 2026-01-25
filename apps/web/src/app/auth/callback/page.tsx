"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { checkAuthStatus } from "@/lib/auth"

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState("Processing login...")

    useEffect(() => {
        const handleAuth = async () => {
            const orgId = searchParams.get("orgId")
            
            if (orgId) {
                localStorage.setItem("orgId", orgId)
            } else {
                localStorage.removeItem("orgId")
            }
            
            try {
                // Cookies should be set by the redirect response from backend
                const user = await checkAuthStatus()
                if (user) {
                    if (user.roles?.some((r: any) => r.name === 'Admin')) {
                        await router.push("/admin")
                    } else {
                        // Always redirect to dashboard - org onboarding will handle if needed
                        await router.push("/dashboard")
                    }
                } else {
                    throw new Error("Authentication failed")
                }
            } catch (err) {
                console.error("Failed to verify authentication", err)
                setStatus("Authentication failed. Please try again.")
                setTimeout(() => router.push("/auth/login"), 2000)
            }
        }
        handleAuth()
    }, [router, searchParams])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Authenticating</h2>
                <p className="text-muted-foreground">{status}</p>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold mb-2">Loading...</h2>
                </div>
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
