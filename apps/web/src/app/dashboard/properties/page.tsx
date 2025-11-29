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

    useEffect(() => {
        fetchProperties()
    }, [])

    async function fetchProperties() {
        try {
            const data = await api.get('/properties')
            setProperties(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateProperty(e: React.FormEvent) {
        e.preventDefault()
        try {
            await api.post('/properties', {
                ...newProperty,
                tenantId: "none", // Mock tenant ID for now
            })
            setIsDialogOpen(false)
            setNewProperty({ name: "", address: "" })
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
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
