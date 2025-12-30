"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Building2, LayoutDashboard, Building, Users, FileText, Settings, LogOut, DollarSign } from "lucide-react"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Properties",
        href: "/dashboard/properties",
        icon: Building,
    },
    {
        title: "Occupants",
        href: "/dashboard/occupants",
        icon: Users,
    },
    {
        title: "Leases",
        href: "/dashboard/leases",
        icon: FileText,
    },
    {
        title: "Billing",
        href: "/dashboard/billing",
        icon: DollarSign,
    },
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
    },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    function handleSignOut() {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("tenantId")
        router.push("/auth/login")
    }

    return (
        <div className="flex h-full flex-col bg-sidebar-background">
            {/* Logo */}
            <div className="flex h-14 items-center border-b border-sidebar-border px-6">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-foreground">
                        <Building2 className="h-4 w-4 text-sidebar-background" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight text-sidebar-foreground">RentEase</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-3">
                    {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Sign Out */}
            <div className="border-t border-sidebar-border p-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-destructive"
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
