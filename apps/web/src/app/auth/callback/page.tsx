"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getProfile } from "@/lib/auth"

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState("Processing login...")

    useEffect(() => {
        const handleAuth = async () => {
            const token = searchParams.get("token")
            if (token) {
                localStorage.setItem("token", token)
                
                try {
                    const user = await getProfile(token)
                    if (user.roles?.some((r: any) => r.name === 'Admin')) {
                        await router.push("/admin")
                    } else if (user.tenantMemberships?.length > 0) {
                        await router.push("/portal")
                    } else {
                        await router.push("/dashboard")
                    }
                } catch (err) {
                    console.error("Failed to fetch profile", err)
                    setStatus("Failed to verify user profile.")
                    await router.push("/auth/login")
                }
            } else {
                await router.push("/auth/login")
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
