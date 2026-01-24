"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, Users, DollarSign, Activity, Building2 } from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { api } from "@/lib/api"

export default function DashboardPage() {
    const { tenantId, hasTenant, isLoading: tenantLoading } = useTenant()
    const router = useRouter()
    const [stats, setStats] = useState({
        properties: 0,
        tenants: 0,
        revenue: 0,
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!tenantLoading && !hasTenant) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasTenant) {
            fetchStats()
        }
    }, [hasTenant, tenantLoading])

    async function fetchStats() {
        try {
            // Fetch actual data
            const [properties, invoices] = await Promise.all([
                api.get('/properties'),
                api.get('/invoices'),
            ])
            
            const totalRevenue = invoices
                .filter((inv: any) => inv.status === 'PAID')
                .reduce((sum: number, inv: any) => sum + Number(inv.amount), 0)

            setStats({
                properties: properties.length,
                tenants: 0, // TODO: Fetch actual tenants count
                revenue: totalRevenue,
            })
        } catch (err) {
            console.error("Error fetching stats:", err)
        } finally {
            setIsLoading(false)
        }
    }

    // Show loading while checking tenant status
    if (tenantLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        )
    }

    // No tenant - show prompt to create one
    if (!hasTenant) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                                <Building2 className="h-6 w-6 text-foreground" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold">Welcome to RentEase</h3>
                        <p className="text-muted-foreground text-sm">
                            Create your organization to start managing properties.
                        </p>
                        <Button onClick={() => router.push("/dashboard/onboarding")}>
                            Get Started
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${stats.revenue.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            From paid invoices
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Properties
                        </CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.properties}</div>
                        <p className="text-xs text-muted-foreground">
                            Active properties
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Tenants
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.tenants}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all properties
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0%</div>
                        <p className="text-xs text-muted-foreground">
                            Units occupied
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
