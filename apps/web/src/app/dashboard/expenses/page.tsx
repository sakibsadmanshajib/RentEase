"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Receipt, Plus } from "lucide-react"
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

interface Expense {
    id: string;
    category: string;
    description: string;
    amount: number;
    currency: string;
    date?: string;
    isRecurring?: boolean;
}

export default function ExpensesPage() {
    const { hasOrg, isLoading: orgLoading } = useOrg()
    const router = useRouter()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newExpense, setNewExpense] = useState({
        category: "",
        description: "",
        amount: "",
        currency: "USD",
    })

    useEffect(() => {
        if (!orgLoading && !hasOrg) {
            router.push("/dashboard/onboarding")
            return
        }
        if (hasOrg) {
            fetchExpenses()
        }
    }, [hasOrg, orgLoading, router])

    async function fetchExpenses() {
        try {
            const data = await api.get("/invoices/expenses")
            setExpenses(data)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load expenses")
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateExpense(e: React.FormEvent) {
        e.preventDefault()
        try {
            await api.post("/invoices/expenses", {
                category: newExpense.category,
                description: newExpense.description,
                amount: Number(newExpense.amount),
                currency: newExpense.currency,
            })
            setIsDialogOpen(false)
            setNewExpense({ category: "", description: "", amount: "", currency: "USD" })
            fetchExpenses()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create expense")
        }
    }

    async function handleDeleteExpense(id: string) {
        if (!confirm("Delete this expense?")) return
        try {
            await api.delete(`/invoices/expenses/${id}`)
            fetchExpenses()
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to delete expense")
        }
    }

    if (orgLoading || !hasOrg) {
        return <div className="text-muted-foreground">Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold tracking-tight">Expenses</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Record Expense</DialogTitle>
                            <DialogDescription>Track property operating costs.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateExpense}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input
                                        id="category"
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        placeholder="Maintenance"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={newExpense.description}
                                        onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Save Expense</Button>
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
                <div className="text-muted-foreground">Loading expenses...</div>
            ) : expenses.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground">No expenses recorded yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {expenses.map((expense) => (
                        <Card key={expense.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{expense.category}</CardTitle>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">${Number(expense.amount).toLocaleString()}</div>
                                <p className="text-sm text-muted-foreground mt-2">{expense.description}</p>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="mt-4"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                >
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
