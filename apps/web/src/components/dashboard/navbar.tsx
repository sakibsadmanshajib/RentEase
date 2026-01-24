"use client"

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
import { Bell, Loader2, DollarSign, FileText, Wrench } from "lucide-react"
import { useUser } from "@/hooks/useUser"
import { logout } from "@/lib/auth"

const notifications = [
    {
        id: 1,
        title: "Rent payment received",
        description: "Unit 101 - $1,500",
        icon: DollarSign,
        time: "2 hours ago",
    },
    {
        id: 2,
        title: "Lease expiring soon",
        description: "Unit 205 expires in 30 days",
        icon: FileText,
        time: "5 hours ago",
    },
    {
        id: 3,
        title: "Maintenance request",
        description: "Plumbing issue in Unit 303",
        icon: Wrench,
        time: "1 day ago",
    },
]

export function DashboardNavbar() {
    const router = useRouter()
    const { user, loading } = useUser()

    async function handleLogout() {
        await logout()
        localStorage.removeItem('orgId')
        router.push('/auth/login')
    }

    const getInitials = () => {
        if (!user) return '?'
        const first = user.firstName?.charAt(0) || ''
        const last = user.lastName?.charAt(0) || ''
        if (first || last) return (first + last).toUpperCase()
        return user.email?.charAt(0).toUpperCase() || '?'
    }

    const getDisplayName = () => {
        if (!user) return 'Loading...'
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim()
        }
        return user.email?.split('@')[0] || 'User'
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6">
            <div className="flex-1">
                <h1 className="text-lg font-semibold">Overview</h1>
            </div>
            <div className="flex items-center gap-2">
                {/* Notifications Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-9 w-9">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-foreground" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80" align="end">
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">Notifications</span>
                                <span className="text-xs text-muted-foreground">{notifications.length} new</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {notifications.map((notification) => (
                            <DropdownMenuItem key={notification.id} className="flex items-start gap-3 p-3 cursor-pointer">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                                    <notification.icon className="h-4 w-4 text-foreground" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground">{notification.time}</p>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="user-menu">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="/avatars/01.png" alt={getDisplayName()} />
                                <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
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
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}

