"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Plus, Mail, Phone } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Tenant {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newTenant, setNewTenant] = useState({ firstName: "", lastName: "", email: "", phone: "" })
    const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)

    useEffect(() => {
        fetchTenants()
    }, [])

    async function fetchTenants() {
        try {
            const data = await api.get(`/tenants?t=${Date.now()}`)
            const mappedTenants = data.map((t: any) => {
                const nameParts = t.name ? t.name.split(' ') : ['', ''];
                return {
                    id: t.id,
                    firstName: nameParts[0] || '',
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: t.contactEmail || '',
                    phone: t.contactPhone || ''
                };
            });
            setTenants(mappedTenants)
        } catch (err: any) {
            console.error('Fetch error:', err);
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateTenant(e: React.FormEvent) {
        e.preventDefault()
        try {
            await api.post('/tenants', newTenant)
            setIsDialogOpen(false)
            setNewTenant({ firstName: "", lastName: "", email: "", phone: "" })
            fetchTenants()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleUpdateTenant(e: React.FormEvent) {
        e.preventDefault()
        if (!editingTenant) return
        try {
            await api.patch(`/tenants/${editingTenant.id}`, {
                firstName: editingTenant.firstName,
                lastName: editingTenant.lastName,
                email: editingTenant.email,
                phone: editingTenant.phone
            })
            setEditingTenant(null)
            fetchTenants()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleDeleteTenant(id: string) {
        if (!confirm("Are you sure you want to delete this tenant?")) return
        try {
            await api.delete(`/tenants/${id}`)
            fetchTenants()
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tenant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Tenant</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new tenant.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateTenant}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={newTenant.firstName}
                                            onChange={(e) => setNewTenant({ ...newTenant, firstName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={newTenant.lastName}
                                            onChange={(e) => setNewTenant({ ...newTenant, lastName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newTenant.email}
                                        onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={newTenant.phone}
                                        onChange={(e) => setNewTenant({ ...newTenant, phone: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Tenant</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!editingTenant} onOpenChange={(open) => !open && setEditingTenant(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Tenant</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateTenant}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-firstName">First Name</Label>
                                        <Input
                                            id="edit-firstName"
                                            value={editingTenant?.firstName || ""}
                                            onChange={(e) => setEditingTenant(prev => prev ? { ...prev, firstName: e.target.value } : null)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-lastName">Last Name</Label>
                                        <Input
                                            id="edit-lastName"
                                            value={editingTenant?.lastName || ""}
                                            onChange={(e) => setEditingTenant(prev => prev ? { ...prev, lastName: e.target.value } : null)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        value={editingTenant?.email || ""}
                                        onChange={(e) => setEditingTenant(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-phone">Phone</Label>
                                    <Input
                                        id="edit-phone"
                                        value={editingTenant?.phone || ""}
                                        onChange={(e) => setEditingTenant(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Tenant</Button>
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
            ) : tenants.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No tenants found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {tenants.map((tenant) => (
                        <Card key={tenant.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {tenant.firstName} {tenant.lastName}
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 mt-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Mail className="h-4 w-4" />
                                        <span>{tenant.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="h-4 w-4" />
                                        <span>{tenant.phone}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setEditingTenant(tenant)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteTenant(tenant.id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
