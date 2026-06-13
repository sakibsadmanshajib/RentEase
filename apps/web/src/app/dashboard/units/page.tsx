"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DoorOpen, Plus, Building2 } from "lucide-react"
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

interface Property {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    unitNumber: string;
    status: string;
    propertyId: string;
    bedrooms?: number;
    bathrooms?: number;
}

export default function UnitsPage() {
    const { hasOrg, isLoading: orgLoading } = useOrg()
    const router = useRouter()
    const [properties, setProperties] = useState<Property[]>([])
    const [units, setUnits] = useState<Unit[]>([])
    const [selectedPropertyId, setSelectedPropertyId] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newUnit, setNewUnit] = useState({ unitNumber: "", bedrooms: "", bathrooms: "" })

    useEffect(() => {
        if (!orgLoading && !hasOrg) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasOrg) {
            fetchProperties()
        }
    }, [hasOrg, orgLoading, router])

    useEffect(() => {
        if (selectedPropertyId) {
            fetchUnits(selectedPropertyId)
        } else {
            setUnits([])
            setIsLoading(false)
        }
    }, [selectedPropertyId])

    async function fetchProperties() {
        try {
            const data = await api.get("/properties")
            setProperties(data)
            if (data.length > 0) {
                setSelectedPropertyId(data[0].id)
            } else {
                setIsLoading(false)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load properties")
            setIsLoading(false)
        }
    }

    async function fetchUnits(propertyId: string) {
        setIsLoading(true)
        try {
            const data = await api.get(`/units/property/${propertyId}`)
            setUnits(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load units")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateUnit(e: React.FormEvent) {
        e.preventDefault()
        if (!selectedPropertyId) {
            setError("Select a property first")
            return
        }
        try {
            await api.post("/units", {
                propertyId: selectedPropertyId,
                unitNumber: newUnit.unitNumber,
                bedrooms: newUnit.bedrooms ? Number(newUnit.bedrooms) : undefined,
                bathrooms: newUnit.bathrooms ? Number(newUnit.bathrooms) : undefined,
            })
            setIsDialogOpen(false)
            setNewUnit({ unitNumber: "", bedrooms: "", bathrooms: "" })
            fetchUnits(selectedPropertyId)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create unit")
        }
    }

    async function handleStatusChange(unitId: string, status: string) {
        try {
            await api.patch(`/units/${unitId}/status`, { status })
            if (selectedPropertyId) {
                fetchUnits(selectedPropertyId)
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update unit status")
        }
    }

    if (orgLoading) {
        return <div className="text-muted-foreground">Loading...</div>
    }

    if (!hasOrg) {
        return null
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Units</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button disabled={!selectedPropertyId}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Unit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Unit</DialogTitle>
                            <DialogDescription>Create a unit for the selected property.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateUnit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="unitNumber">Unit Number</Label>
                                    <Input
                                        id="unitNumber"
                                        value={newUnit.unitNumber}
                                        onChange={(e) => setNewUnit({ ...newUnit, unitNumber: e.target.value })}
                                        placeholder="101"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="bedrooms">Bedrooms</Label>
                                        <Input
                                            id="bedrooms"
                                            type="number"
                                            value={newUnit.bedrooms}
                                            onChange={(e) => setNewUnit({ ...newUnit, bedrooms: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bathrooms">Bathrooms</Label>
                                        <Input
                                            id="bathrooms"
                                            type="number"
                                            value={newUnit.bathrooms}
                                            onChange={(e) => setNewUnit({ ...newUnit, bathrooms: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Unit</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-2 max-w-sm">
                <Label htmlFor="property">Property</Label>
                <select
                    id="property"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={selectedPropertyId}
                    onChange={(e) => setSelectedPropertyId(e.target.value)}
                >
                    <option value="">Select a property</option>
                    {properties.map((property) => (
                        <option key={property.id} value={property.id}>
                            {property.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="text-muted-foreground">Loading units...</div>
            ) : properties.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">Create a property before adding units.</p>
                        <Button className="mt-4" onClick={() => router.push("/dashboard/properties")}>
                            <Building2 className="mr-2 h-4 w-4" />
                            Go to Properties
                        </Button>
                    </CardContent>
                </Card>
            ) : units.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No units found for this property.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {units.map((unit) => (
                        <Card key={unit.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Unit {unit.unitNumber}</CardTitle>
                                <DoorOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground capitalize">Status: {unit.status}</p>
                                <div className="flex gap-2 mt-4">
                                    {unit.status !== "OCCUPIED" && (
                                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(unit.id, "OCCUPIED")}>
                                            Mark Occupied
                                        </Button>
                                    )}
                                    {unit.status !== "VACANT" && (
                                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(unit.id, "VACANT")}>
                                            Mark Vacant
                                        </Button>
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
