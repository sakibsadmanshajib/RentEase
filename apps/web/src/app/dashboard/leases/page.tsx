"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, Calendar, DollarSign } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    propertyId: string;
    tenantId: string;
    isActive: boolean;
}

export default function LeasesPage() {
    const [leases, setLeases] = useState<Lease[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newLease, setNewLease] = useState({ startDate: "", endDate: "", rentAmount: "", propertyId: "", tenantId: "" })
    const [editingLease, setEditingLease] = useState<Lease | null>(null)

    useEffect(() => {
        fetchLeases()
    }, [])

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

    async function handleCreateLease(e: React.FormEvent) {
        e.preventDefault()
        try {
            await api.post('/leases', {
                ...newLease,
                rentAmount: parseFloat(newLease.rentAmount),
            })
            setIsDialogOpen(false)
            setNewLease({ startDate: "", endDate: "", rentAmount: "", propertyId: "", tenantId: "" })
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Leases</h2>
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
                                    <Label htmlFor="propertyId">Property ID</Label>
                                    <Input
                                        id="propertyId"
                                        value={newLease.propertyId}
                                        onChange={(e) => setNewLease({ ...newLease, propertyId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tenantId">Tenant ID</Label>
                                    <Input
                                        id="tenantId"
                                        value={newLease.tenantId}
                                        onChange={(e) => setNewLease({ ...newLease, tenantId: e.target.value })}
                                        required
                                    />
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
                <div>Loading leases...</div>
            ) : leases.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No leases found.</p>
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
