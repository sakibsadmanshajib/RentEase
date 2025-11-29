"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, DollarSign, Home } from "lucide-react"

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    propertyId: string;
    isActive: boolean;
}

export default function TenantPortalPage() {
    const [leases, setLeases] = useState<Lease[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        fetchLeases()
    }, [])

    async function fetchLeases() {
        try {
            // For MVP, we'll just fetch all leases. In production, we'd fetch by tenant ID.
            const data = await api.get('/leases')
            setLeases(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Leases</h2>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div>Loading leases...</div>
            ) : leases.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No active leases found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {leases.map((lease) => (
                        <Card key={lease.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Lease #{lease.id.slice(0, 8)}
                                </CardTitle>
                                <Home className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    ${lease.rentAmount}
                                    <span className="text-xs font-normal text-muted-foreground">/month</span>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Button className="w-full">
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        Pay Rent
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
