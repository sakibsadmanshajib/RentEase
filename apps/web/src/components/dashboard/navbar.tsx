"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Loader2 } from "lucide-react"
import { useUser } from "@/hooks/useUser"

export function DashboardNavbar() {
    const router = useRouter()
    const { user, loading } = useUser()

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('tenantId')
        router.push('/auth/login')
    }

    // Generate initials from user name
    const getInitials = () => {
        if (!user) return '?'
        const first = user.firstName?.charAt(0) || ''
        const last = user.lastName?.charAt(0) || ''
        if (first || last) return (first + last).toUpperCase()
        return user.email?.charAt(0).toUpperCase() || '?'
    }

    // Get display name
    const getDisplayName = () => {
        if (!user) return 'Loading...'
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        return user.email?.split('@')[0] || 'User'
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex-1">
                <h1 className="text-lg font-semibold">Overview</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
                    <span className="sr-only">Notifications</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="user-menu">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt={getDisplayName()} />
                                <AvatarFallback>
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : getInitials()}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {loading ? 'Loading...' : getDisplayName()}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {loading ? '' : user?.email || ''}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

