"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useOrg } from "@/contexts/org-context"

interface Occupant {
    id: string;
    userId: string;
    leaseId: string;
    lease?: {
        id: string;
        status: string;
        rentAmount: number;
    };
}

export default function TenantsPage() {
    const { hasOrg, isLoading: orgLoading } = useOrg()
    const router = useRouter()
    const [occupants, setOccupants] = useState<Occupant[]>([])
    const [leases, setLeases] = useState<Array<{ id: string; status: string }>>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newOccupant, setNewOccupant] = useState({ leaseId: "", userId: "" })

    useEffect(() => {
        if (!orgLoading && !hasOrg) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasOrg) {
            fetchOccupants()
            fetchLeases()
        }
    }, [hasOrg, orgLoading, router])

    async function fetchOccupants() {
        try {
            const data = await api.get("/leases/occupants")
            setOccupants(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load occupants")
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchLeases() {
        try {
            const data = await api.get("/leases")
            setLeases(data)
        } catch (err: unknown) {
            console.error("Failed to load leases", err)
        }
    }

    async function handleAddOccupant(e: React.FormEvent) {
        e.preventDefault()
        try {
            await api.post(`/leases/${newOccupant.leaseId}/occupants`, {
                userId: newOccupant.userId,
            })
            setIsDialogOpen(false)
            setNewOccupant({ leaseId: "", userId: "" })
            fetchOccupants()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to add occupant")
        }
    }

    if (orgLoading || !hasOrg) {
        return <div className="text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Tenants</h2>
                    <p className="text-sm text-muted-foreground">Lease occupants linked to identity user accounts.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Occupant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Lease Occupant</DialogTitle>
                            <DialogDescription>
                                Link a registered user to a lease by user ID.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddOccupant}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="leaseId">Lease</Label>
                                    <select
                                        id="leaseId"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={newOccupant.leaseId}
                                        onChange={(e) => setNewOccupant({ ...newOccupant, leaseId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a lease</option>
                                        {leases.map((lease) => (
                                            <option key={lease.id} value={lease.id}>
                                                Lease #{lease.id.slice(0, 8)} ({lease.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="userId">User ID</Label>
                                    <Input
                                        id="userId"
                                        value={newOccupant.userId}
                                        onChange={(e) => setNewOccupant({ ...newOccupant, userId: e.target.value })}
                                        placeholder="Identity service user UUID"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Occupant</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div>Loading tenants...</div>
            ) : occupants.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No lease occupants found. Add occupants from active leases.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {occupants.map((occupant) => (
                        <Card key={occupant.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    User {occupant.userId.slice(0, 8)}
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>Lease: #{occupant.leaseId.slice(0, 8)}</p>
                                    {occupant.lease && (
                                        <p>Status: {occupant.lease.status} · ${occupant.lease.rentAmount}/mo</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
