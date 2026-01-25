"use client"

import { useState, useEffect, useCallback } from 'react'
import { checkAuthStatus, AuthUser } from '@/lib/auth'

interface UseUserReturn {
    user: AuthUser | null
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export function useUser(): UseUserReturn {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchUser = useCallback(async () => {
        try {
            const profile = await checkAuthStatus()
            setUser(profile) // Will be null if not authenticated
            setError(null)
        } catch (err) {
            console.error('Failed to fetch user profile:', err)
            // Don't set error on simple 401/unauth, just set user to null
            // Only set error if it's a network error or something unexpected
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        let isMounted = true
        
        const runFetch = async () => {
            try {
                const profile = await checkAuthStatus()
                if (isMounted) {
                    setUser(profile)
                    setError(null)
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Failed to fetch user profile:', err)
                    setUser(null)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }
        
        runFetch()
        
        return () => {
            isMounted = false
        }
    }, [])

    return {
        user,
        loading,
        error,
        refetch: fetchUser
    }
}
