"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, DollarSign, Home } from "lucide-react"

interface Lease {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    status: string;
}

interface Invoice {
    id: string;
    leaseId?: string;
    amount: number;
    status: string;
    dueDate: string;
    description?: string;
}

export default function TenantPortalPage() {
    const [leases, setLeases] = useState<Lease[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)

    useEffect(() => {
        fetchTenantData()
    }, [])

    async function fetchTenantData() {
        try {
            const [leaseData, invoiceData] = await Promise.all([
                api.get("/leases/me"),
                api.get("/invoices/me"),
            ])
            setLeases(leaseData)
            setInvoices(invoiceData)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load tenant data")
        } finally {
            setIsLoading(false)
        }
    }

    async function handlePayRent(invoice: Invoice) {
        setPayingInvoiceId(invoice.id)
        setError("")
        try {
            await api.post("/invoices/payments", {
                invoiceId: invoice.id,
                amount: invoice.amount,
                method: "BANK_TRANSFER",
            })
            await fetchTenantData()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Payment failed")
        } finally {
            setPayingInvoiceId(null)
        }
    }

    const pendingInvoices = invoices.filter((invoice) => invoice.status === "PENDING" || invoice.status === "PARTIAL")

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Portal</h2>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <section className="space-y-4">
                <h3 className="text-xl font-semibold">My Leases</h3>
                {isLoading ? (
                    <div>Loading leases...</div>
                ) : leases.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">No active leases found for your account.</p>
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
                                    <Home className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
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
                                        <p>Status: {lease.status}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h3 className="text-xl font-semibold">Outstanding Invoices</h3>
                {isLoading ? (
                    <div>Loading invoices...</div>
                ) : pendingInvoices.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">No outstanding invoices.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {pendingInvoices.map((invoice) => (
                            <Card key={invoice.id}>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium">
                                        Invoice #{invoice.id.slice(0, 8)}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${Number(invoice.amount).toLocaleString()}</div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                                    </p>
                                    {invoice.description && (
                                        <p className="text-sm text-muted-foreground">{invoice.description}</p>
                                    )}
                                    <Button
                                        className="w-full mt-4"
                                        onClick={() => handlePayRent(invoice)}
                                        disabled={payingInvoiceId === invoice.id}
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        {payingInvoiceId === invoice.id ? "Processing..." : "Pay Rent"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
