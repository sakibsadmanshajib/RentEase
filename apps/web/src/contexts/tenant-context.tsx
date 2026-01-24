"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface TenantContextType {
    tenantId: string | null
    hasTenant: boolean
    isLoading: boolean
}

const TenantContext = createContext<TenantContextType>({
    tenantId: null,
    hasTenant: false,
    isLoading: true,
})

export function useTenant() {
    return useContext(TenantContext)
}

export function TenantProvider({ children }: { children: ReactNode }) {
    const [tenantId, setTenantId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const storedTenantId = localStorage.getItem('tenantId')
        setTenantId(storedTenantId)
        setIsLoading(false)

        // If on dashboard and no tenant, redirect to onboarding
        if (!storedTenantId && pathname?.startsWith('/dashboard') && pathname !== '/dashboard/onboarding') {
            router.push('/dashboard/onboarding')
        }
    }, [pathname, router])

    return (
        <TenantContext.Provider value={{ tenantId, hasTenant: !!tenantId, isLoading }}>
            {children}
        </TenantContext.Provider>
    )
}
