"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building, MapPin, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Property {
    id: string;
    name: string;
    address: string;
    tenantId: string;
}

export default function PropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newProperty, setNewProperty] = useState({ name: "", address: "" })

    const [editingProperty, setEditingProperty] = useState<Property | null>(null)

    useEffect(() => {
        fetchProperties()
    }, [])

    async function fetchProperties() {
        try {
            console.log("Fetching properties...")
            const data = await api.get(`/properties?t=${Date.now()}`)
            console.log("Fetched properties:", data)
            console.log('Fetched properties IDs:', data.map((p: any) => p.id))
            setProperties(data)
        } catch (err: any) {
            console.error("Error fetching properties:", err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateProperty(e: React.FormEvent) {
        e.preventDefault()
        console.log("Creating property:", newProperty)
        try {
            const res = await api.post('/properties', {
                ...newProperty,
                tenantId: "none", // Mock tenant ID for now
            })
            console.log("Property created:", res)
            setIsDialogOpen(false)
            setNewProperty({ name: "", address: "" })
            fetchProperties()
        } catch (err: any) {
            console.error("Error creating property:", err)
            setError(err.message)
        }
    }

    async function handleUpdateProperty(e: React.FormEvent) {
        e.preventDefault()
        if (!editingProperty) return
        try {
            await api.patch(`/properties/${editingProperty.id}`, {
                name: editingProperty.name,
                address: editingProperty.address
            })
            setEditingProperty(null)
            fetchProperties()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleDeleteProperty(id: string) {
        if (!confirm("Are you sure you want to delete this property?")) return
        try {
            await api.delete(`/properties/${id}`)
            fetchProperties()
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">My Properties</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Property
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Property</DialogTitle>
                            <DialogDescription>
                                Enter the details of the new property.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateProperty}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Property Name</Label>
                                    <Input
                                        id="name"
                                        value={newProperty.name}
                                        onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
                                        placeholder="e.g. Sunset Apartments"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Input
                                        id="address"
                                        value={newProperty.address}
                                        onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                                        placeholder="123 Main St"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Property</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!editingProperty} onOpenChange={(open) => !open && setEditingProperty(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Property</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateProperty}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Property Name</Label>
                                    <Input
                                        id="edit-name"
                                        value={editingProperty?.name || ""}
                                        onChange={(e) => setEditingProperty(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-address">Address</Label>
                                    <Input
                                        id="edit-address"
                                        value={editingProperty?.address || ""}
                                        onChange={(e) => setEditingProperty(prev => prev ? { ...prev, address: e.target.value } : null)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Property</Button>
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
                <div>Loading properties...</div>
            ) : properties.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No properties found. Add your first one!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property) => (
                        <Card key={property.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {property.name}
                                </CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{property.address}</span>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <Button variant="outline" size="sm" onClick={() => setEditingProperty(property)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteProperty(property.id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
