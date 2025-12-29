"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Mail, Phone, Building2 } from "lucide-react"
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

interface Occupant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    leaseId?: string;
}

// Note: In a real app, occupants would have their own service/table
// For now, we'll use a simple in-memory mock
export default function OccupantsPage() {
    const { tenantId, hasTenant, isLoading: tenantLoading } = useTenant()
    const router = useRouter()
    const [occupants, setOccupants] = useState<Occupant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newOccupant, setNewOccupant] = useState({ firstName: "", lastName: "", email: "", phone: "" })
    const [editingOccupant, setEditingOccupant] = useState<Occupant | null>(null)

    useEffect(() => {
        if (!tenantLoading && !hasTenant) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasTenant) {
            // In a real app, we'd fetch from an occupants API
            // For now, get occupants from localStorage for demo
            const stored = localStorage.getItem(`occupants_${tenantId}`)
            if (stored) {
                setOccupants(JSON.parse(stored))
            }
            setIsLoading(false)
        }
    }, [hasTenant, tenantLoading, tenantId])

    function saveOccupants(updated: Occupant[]) {
        setOccupants(updated)
        localStorage.setItem(`occupants_${tenantId}`, JSON.stringify(updated))
    }

    function handleCreateOccupant(e: React.FormEvent) {
        e.preventDefault()
        const newId = crypto.randomUUID()
        const occupant: Occupant = {
            id: newId,
            ...newOccupant,
        }
        saveOccupants([...occupants, occupant])
        setIsDialogOpen(false)
        setNewOccupant({ firstName: "", lastName: "", email: "", phone: "" })
    }

    function handleUpdateOccupant(e: React.FormEvent) {
        e.preventDefault()
        if (!editingOccupant) return
        const updated = occupants.map(o => 
            o.id === editingOccupant.id ? editingOccupant : o
        )
        saveOccupants(updated)
        setEditingOccupant(null)
    }

    function handleDeleteOccupant(id: string) {
        if (!confirm("Are you sure you want to remove this occupant?")) return
        const updated = occupants.filter(o => o.id !== id)
        saveOccupants(updated)
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
                            You need to create or join an organization first.
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
                <h2 className="text-2xl font-semibold tracking-tight">Occupants</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Occupant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Occupant</DialogTitle>
                            <DialogDescription>
                                Enter the details of the renter.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateOccupant}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={newOccupant.firstName}
                                            onChange={(e) => setNewOccupant({ ...newOccupant, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={newOccupant.lastName}
                                            onChange={(e) => setNewOccupant({ ...newOccupant, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newOccupant.email}
                                        onChange={(e) => setNewOccupant({ ...newOccupant, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={newOccupant.phone}
                                        onChange={(e) => setNewOccupant({ ...newOccupant, phone: e.target.value })}
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

                <Dialog open={!!editingOccupant} onOpenChange={(open) => !open && setEditingOccupant(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Occupant</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateOccupant}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-firstName">First Name</Label>
                                        <Input
                                            id="edit-firstName"
                                            value={editingOccupant?.firstName || ""}
                                            onChange={(e) => setEditingOccupant(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-lastName">Last Name</Label>
                                        <Input
                                            id="edit-lastName"
                                            value={editingOccupant?.lastName || ""}
                                            onChange={(e) => setEditingOccupant(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editingOccupant?.email || ""}
                                        onChange={(e) => setEditingOccupant(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editingOccupant?.phone || ""}
                                        onChange={(e) => setEditingOccupant(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Occupant</Button>
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
                <div className="text-muted-foreground">Loading occupants...</div>
            ) : occupants.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No occupants found. Add your first renter!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {occupants.map((occupant) => (
                        <Card key={occupant.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {occupant.firstName} {occupant.lastName}
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{occupant.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{occupant.phone}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setEditingOccupant(occupant)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteOccupant(occupant.id)}>Remove</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
