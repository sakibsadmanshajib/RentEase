"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { checkAuthStatus, type AuthUser } from "@/lib/auth"

const TENANT_ROLE = "tenant"
const LANDLORD_ROLES = new Set(["admin", "owner", "manager", "landlord"])

export function RoleRouter({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadUser() {
            const profile = await checkAuthStatus()
            setUser(profile)
            setIsLoading(false)
        }
        loadUser()
    }, [])

    useEffect(() => {
        if (isLoading || !user) {
            return
        }

        const roles = user.roles ?? []
        const isTenantOnly = roles.includes(TENANT_ROLE) && !roles.some((role) => LANDLORD_ROLES.has(role))
        const isOnTenantPortal = pathname.startsWith("/dashboard/tenant")
        const isOnOnboarding = pathname.startsWith("/dashboard/onboarding")

        if (isTenantOnly && !isOnTenantPortal && !isOnOnboarding) {
            router.replace("/dashboard/tenant")
        }

        if (!isTenantOnly && isOnTenantPortal && roles.length > 0) {
            router.replace("/dashboard")
        }
    }, [isLoading, user, pathname, router])

    if (isLoading) {
        return <div className="text-muted-foreground p-6">Loading...</div>
    }

    return <>{children}</>
}
