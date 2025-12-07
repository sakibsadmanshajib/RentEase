"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getProfile } from "@/lib/auth"

export default function AuthCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState("Processing login...")

    useEffect(() => {
        const token = searchParams.get("token")
        if (token) {
            localStorage.setItem("token", token)
            
            getProfile(token)
                .then((user) => {
                    if (user.roles?.some((r: any) => r.name === 'Admin')) {
                        router.push("/admin");
                    } else if (user.tenantMemberships?.length > 0) {
                        router.push("/portal");
                    } else {
                        router.push("/dashboard");
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch profile", err)
                    setStatus("Failed to verify user profile.")
                    router.push("/auth/login")
                })

        } else {
            router.push("/auth/login")
        }
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
