"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DollarSign, Plus, CheckCircle, Clock } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Invoice {
    id: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    dueDate: string;
    description?: string;
    lineItems: { description: string; amount: number }[];
}

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newInvoice, setNewInvoice] = useState({ amount: "", description: "", dueDate: "", tenantId: "", leaseId: "" })

    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

    useEffect(() => {
        fetchInvoices()
    }, [])

    async function fetchInvoices() {
        try {
            const data = await api.get(`/invoices?t=${Date.now()}`)
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
        try {
            await api.post('/invoices', {
                tenantId: newInvoice.tenantId,
                leaseId: newInvoice.leaseId || undefined,
                amount: parseFloat(newInvoice.amount),
                description: newInvoice.description,
                dueDate: new Date(newInvoice.dueDate).toISOString(),
                lineItems: [{ description: newInvoice.description, amount: parseFloat(newInvoice.amount) }]
            })
            setIsDialogOpen(false)
            setNewInvoice({ amount: "", description: "", dueDate: "", tenantId: "", leaseId: "" })
            fetchInvoices()
        } catch (err: any) {
            setError(err.message)
        }
    }

    async function handlePay(invoiceId: string, amount: number) {
        try {
             // Mock tenantId
             const mockTenantId = "org-123";
            await api.post('/invoices/payments', {
                tenantId: mockTenantId,
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
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
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tenantId">Tenant ID</Label>
                                    <Input
                                        id="tenantId"
                                        value={newInvoice.tenantId}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, tenantId: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="leaseId">Lease ID</Label>
                                    <Input
                                        id="leaseId"
                                        value={newInvoice.leaseId}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, leaseId: e.target.value })}
                                    />
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
                <div>Loading invoices...</div>
            ) : invoices.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No invoices found.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {invoices.map((invoice) => (
                        <Card key={invoice.id}>
                            <CardContent className="flex items-center justify-between p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${invoice.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
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
                                            ? 'bg-green-100 text-green-800' 
                                            : invoice.status === 'OVERDUE'
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
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
