"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface OrgContextType {
    orgId: string | null
    hasOrg: boolean
    isLoading: boolean
    setOrgId: (id: string | null) => void
}

const OrgContext = createContext<OrgContextType>({
    orgId: null,
    hasOrg: false,
    isLoading: true,
    setOrgId: () => {},
})

export function useOrg() {
    return useContext(OrgContext)
}

export function OrgProvider({ children }: { children: ReactNode }) {
    const [orgId, setOrgIdState] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    const setOrgId = (id: string | null) => {
        if (id) {
            localStorage.setItem('orgId', id)
        } else {
            localStorage.removeItem('orgId')
        }
        setOrgIdState(id)
    }

    useEffect(() => {
        // Migration: check for legacy tenantId if orgId not present
        let storedOrgId = localStorage.getItem('orgId')
        if (!storedOrgId) {
            const legacyTenantId = localStorage.getItem('tenantId')
            if (legacyTenantId) {
                storedOrgId = legacyTenantId
                localStorage.setItem('orgId', legacyTenantId)
                localStorage.removeItem('tenantId') // Clean up legacy
            }
        }

        setOrgIdState(storedOrgId)
        setIsLoading(false)

        // If on dashboard and no org, redirect to onboarding
        if (!storedOrgId && pathname?.startsWith('/dashboard') && pathname !== '/dashboard/onboarding') {
            router.push('/dashboard/onboarding')
        }
    }, [pathname, router])

    return (
        <OrgContext.Provider value={{ orgId, hasOrg: !!orgId, isLoading, setOrgId }}>
            {children}
        </OrgContext.Provider>
    )
}
