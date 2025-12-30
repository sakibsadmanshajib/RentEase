"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, Calendar, Building2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useTenant } from "@/contexts/tenant-context"

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    propertyId: string;
    tenantId: string;
    status: string;
}

interface Property {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    unitNumber: string;
    status: string;
}

export default function LeasesPage() {
    const { tenantId, hasTenant, isLoading: tenantLoading } = useTenant()
    const router = useRouter()
    const [leases, setLeases] = useState<Lease[]>([])
    const [properties, setProperties] = useState<Property[]>([])
    const [units, setUnits] = useState<Unit[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newLease, setNewLease] = useState({ startDate: "", endDate: "", rentAmount: "", propertyId: "", unitId: "" })
    const [editingLease, setEditingLease] = useState<Lease | null>(null)

    useEffect(() => {
        if (!tenantLoading && !hasTenant) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasTenant) {
            fetchLeases()
            fetchProperties()
        }
    }, [hasTenant, tenantLoading])

    useEffect(() => {
        if (newLease.propertyId) {
            fetchUnits(newLease.propertyId)
        } else {
            setUnits([])
        }
    }, [newLease.propertyId])

    async function fetchLeases() {
        try {
            const data = await api.get(`/leases?t=${Date.now()}`)
            setLeases(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchProperties() {
        try {
            const data = await api.get(`/properties?t=${Date.now()}`)
            setProperties(data)
        } catch (err: any) {
            console.error("Error fetching properties:", err)
        }
    }

    async function fetchUnits(propertyId: string) {
        try {
            const data = await api.get(`/units/property/${propertyId}?t=${Date.now()}`)
            setUnits(data)
        } catch (err: any) {
            console.error("Error fetching units:", err)
        }
    }

    async function handleCreateLease(e: React.FormEvent) {
        e.preventDefault()
        if (!tenantId) {
            setError("No organization selected")
            return
        }
        try {
            const payload: any = {
                ...newLease,
                tenantId,
                rentAmount: parseFloat(newLease.rentAmount),
            }
            if (!payload.unitId) {
                delete payload.unitId
            }
            await api.post('/leases', payload)
            setIsDialogOpen(false)
            setNewLease({ startDate: "", endDate: "", rentAmount: "", propertyId: "", unitId: "" })
            fetchLeases()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleUpdateLease(e: React.FormEvent) {
        e.preventDefault()
        if (!editingLease) return
        try {
            await api.patch(`/leases/${editingLease.id}`, {
                startDate: editingLease.startDate,
                endDate: editingLease.endDate,
                rentAmount: Number(editingLease.rentAmount)
            })
            setEditingLease(null)
            fetchLeases()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleDeleteLease(id: string) {
        if (!confirm("Are you sure you want to delete this lease?")) return
        try {
            await api.delete(`/leases/${id}`)
            fetchLeases()
        } catch (err: any) {
            setError(err.message)
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
                        <h3 className="text-lg font-semibold">No Organization</h3>
                        <p className="text-muted-foreground text-sm">
                            You need to create or join an organization before managing leases.
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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Leases</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Lease
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Lease</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new lease.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateLease}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="startDate">Start Date</Label>
                                        <Input
                                            id="startDate"
                                            type="date"
                                            value={newLease.startDate}
                                            onChange={(e) => setNewLease({ ...newLease, startDate: e.target.value })}
                                            max="9999-12-31"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="endDate">End Date</Label>
                                        <Input
                                            id="endDate"
                                            type="date"
                                            value={newLease.endDate}
                                            onChange={(e) => setNewLease({ ...newLease, endDate: e.target.value })}
                                            max="9999-12-31"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="rentAmount">Rent Amount</Label>
                                    <Input
                                        id="rentAmount"
                                        type="number"
                                        value={newLease.rentAmount}
                                        onChange={(e) => setNewLease({ ...newLease, rentAmount: e.target.value })}
                                        placeholder="1500.00"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="propertyId">Property</Label>
                                    <select
                                        id="propertyId"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newLease.propertyId}
                                        onChange={(e) => setNewLease({ ...newLease, propertyId: e.target.value, unitId: "" })}
                                        required
                                    >
                                        <option value="">Select a property</option>
                                        {properties.map((property) => (
                                            <option key={property.id} value={property.id}>
                                                {property.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="unitId">Unit (Optional)</Label>
                                    <select
                                        id="unitId"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newLease.unitId}
                                        onChange={(e) => setNewLease({ ...newLease, unitId: e.target.value })}
                                        disabled={!newLease.propertyId}
                                    >
                                        <option value="">Select a unit</option>
                                        {units.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.unitNumber} ({unit.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Lease</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!editingLease} onOpenChange={(open) => !open && setEditingLease(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Lease</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateLease}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-startDate">Start Date</Label>
                                        <Input
                                            id="edit-startDate"
                                            type="date"
                                            value={editingLease?.startDate ? new Date(editingLease.startDate).toISOString().split('T')[0] : ""}
                                            onChange={(e) => setEditingLease(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                                            max="9999-12-31"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-endDate">End Date</Label>
                                        <Input
                                            id="edit-endDate"
                                            type="date"
                                            value={editingLease?.endDate ? new Date(editingLease.endDate).toISOString().split('T')[0] : ""}
                                            onChange={(e) => setEditingLease(prev => prev ? { ...prev, endDate: e.target.value } : null)}
                                            max="9999-12-31"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-rentAmount">Rent Amount</Label>
                                    <Input
                                        id="edit-rentAmount"
                                        type="number"
                                        value={editingLease?.rentAmount || ""}
                                        onChange={(e) => setEditingLease(prev => prev ? { ...prev, rentAmount: parseFloat(e.target.value) } : null)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Lease</Button>
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
                <div className="text-muted-foreground">Loading leases...</div>
            ) : leases.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No leases found. Create your first one!</p>
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
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mt-2">
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
                                    <div className="text-xs">
                                        Status: <span className="capitalize">{lease.status || 'Draft'}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setEditingLease(lease)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteLease(lease.id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
