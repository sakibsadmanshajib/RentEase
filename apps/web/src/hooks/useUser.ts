"use client"

import { useState, useEffect } from 'react'
import { getProfile } from '@/lib/auth'

interface User {
    id: string
    email: string
    firstName?: string
    lastName?: string
    tenantMemberships?: Array<{
        tenantId: string
        roleId?: string
    }>
}

interface UseUserReturn {
    user: User | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = async () => {
        const token = localStorage.getItem('token')
        
        if (!token) {
            setUser(null)
            setLoading(false)
            return
        }

        try {
            const profile = await getProfile(token)
            setUser(profile)
            setError(null)
        } catch (err) {
            console.error('Failed to fetch user profile:', err)
            setError('Failed to load user profile')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return {
        user,
        loading,
        error,
        refetch: fetchUser
    }
}
