"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Plus, Building2 } from "lucide-react"
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

interface Invoice {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'CANCELLED';
    dueDate: string;
    description?: string;
    lineItems: { description: string; amount: number }[];
}

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    property?: { name: string };
    unit?: { unitNumber: string };
}

export default function BillingPage() {
    const { tenantId, hasTenant, isLoading: tenantLoading } = useTenant()
    const router = useRouter()
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newInvoice, setNewInvoice] = useState({ amount: "", description: "", dueDate: "", leaseId: "" })
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
    const [leases, setLeases] = useState<Lease[]>([])

    useEffect(() => {
        if (!tenantLoading && !hasTenant) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasTenant) {
            fetchInvoices()
            fetchLeases()
        }
    }, [hasTenant, tenantLoading])

    async function fetchLeases() {
        try {
            const data = await api.get(`/leases`)
            setLeases(data)
        } catch (err: any) {
            console.error("Failed to fetch leases", err)
        }
    }

    async function fetchInvoices() {
        try {
            const data = await api.get(`/invoices`)
            setInvoices(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleUpdateInvoice(e: React.FormEvent) {
        e.preventDefault()
        if (!editingInvoice) return
        try {
            await api.patch(`/invoices/${editingInvoice.id}`, {
                amount: Number(editingInvoice.amount),
                dueDate: editingInvoice.dueDate
            })
            setEditingInvoice(null)
            fetchInvoices()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleDeleteInvoice(id: string) {
        if (!confirm("Are you sure you want to delete this invoice?")) return
        try {
            await api.delete(`/invoices/${id}`)
            fetchInvoices()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handleCreateInvoice(e: React.FormEvent) {
        e.preventDefault()
        if (!tenantId) {
            setError("No organization selected")
            return
        }
        try {
            await api.post('/invoices', {
                tenantId,
                leaseId: newInvoice.leaseId || undefined,
                amount: parseFloat(newInvoice.amount),
                description: newInvoice.description,
                dueDate: new Date(newInvoice.dueDate).toISOString(),
                lineItems: [{ description: newInvoice.description, amount: parseFloat(newInvoice.amount) }]
            })
            setIsDialogOpen(false)
            setNewInvoice({ amount: "", description: "", dueDate: "", leaseId: "" })
            fetchInvoices()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handlePay(invoiceId: string, amount: number) {
        if (!tenantId) {
            setError("No organization selected")
            return
        }
        try {
            await api.post('/invoices/payments', {
                tenantId,
                invoiceId,
                amount,
                date: new Date().toISOString(),
                method: 'BANK_TRANSFER'
            })
            fetchInvoices()
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
                            You need to create or join an organization before managing billing.
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
                <h2 className="text-2xl font-semibold tracking-tight">Billing & Invoices</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Invoice</DialogTitle>
                            <DialogDescription>
                                Enter invoice details.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateInvoice}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={newInvoice.amount}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                        placeholder="1500.00"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newInvoice.description}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
                                        placeholder="Rent for December"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={newInvoice.dueDate}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                                        max="9999-12-31"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="leaseId">Lease (Optional)</Label>
                                    <select
                                        id="leaseId"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newInvoice.leaseId}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, leaseId: e.target.value })}
                                    >
                                        <option value="">Select a lease</option>
                                        {leases.map((lease) => (
                                            <option key={lease.id} value={lease.id}>
                                                {lease.property?.name || 'Unknown Property'} 
                                                {lease.unit?.unitNumber ? ` - Unit ${lease.unit.unitNumber}` : ''} 
                                                ({new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>

                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Invoice</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Invoice</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpdateInvoice}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-amount">Amount</Label>
                                    <Input
                                        id="edit-amount"
                                        type="number"
                                        value={editingInvoice?.amount || ""}
                                        onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, amount: parseFloat(e.target.value) } : null)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-dueDate">Due Date</Label>
                                    <Input
                                        id="edit-dueDate"
                                        type="date"
                                        value={editingInvoice?.dueDate ? new Date(editingInvoice.dueDate).toISOString().split('T')[0] : ""}
                                        onChange={(e) => setEditingInvoice(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                                        max="9999-12-31"
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Update Invoice</Button>
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
                <div className="text-muted-foreground">Loading invoices...</div>
            ) : invoices.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No invoices found. Create your first one!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${invoice.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                        <DollarSign className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">${Number(invoice.amount).toFixed(2)}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {invoice.description || invoice.lineItems?.[0]?.description || 'Invoice'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`px-2 py-1 rounded text-xs font-semibold ${
                                        invoice.status === 'PAID' 
                                            ? 'bg-green-500/10 text-green-500' 
                                            : invoice.status === 'OVERDUE'
                                            ? 'bg-red-500/10 text-red-500'
                                            : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                        {invoice.status}
                                    </div>
                                    {invoice.status !== 'PAID' && (
                                        <Button size="sm" onClick={() => handlePay(invoice.id, invoice.amount)}>
                                            Pay Now
                                        </Button>
                                    )}
                                    <Button variant="outline" size="sm" onClick={() => setEditingInvoice(invoice)}>Edit</Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
