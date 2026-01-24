"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

export default function OnboardingPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [step, setStep] = useState<"choice" | "create" | "join">("choice")

    async function handleCreateOrg(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError("")

        const formData = new FormData(event.currentTarget)
        const name = formData.get("name")

        if (!name || typeof name !== 'string') {
            setError("Organization name is required")
            setIsLoading(false)
            return
        }

        try {
            const response = await api.post("/tenants", { name })
            localStorage.setItem("tenantId", response.id)
            
            // Note: The JWT won't include the new tenantId until user re-logs in.
            // For now this is acceptable as tenantId is also read from localStorage.
            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to create organization")
        } finally {
            setIsLoading(false)
        }
    }

    if (step === "choice") {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="max-w-md w-full space-y-6">
                    <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground">
                                <Building2 className="h-8 w-8 text-background" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight">Welcome to RentEase</h1>
                        <p className="text-muted-foreground">
                            To get started, create or join an organization.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <Card 
                            className="cursor-pointer hover:bg-accent/50 transition-colors"
                            onClick={() => setStep("create")}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Create Organization</CardTitle>
                                <CardDescription>
                                    Start fresh with your own property management organization.
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        <Card 
                            className="cursor-pointer hover:bg-accent/50 transition-colors opacity-50"
                            onClick={() => setError("Join via invitation link coming soon!")}
                        >
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Join Existing</CardTitle>
                                <CardDescription>
                                    You&apos;ll need an invitation link from an existing organization.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    {error && (
                        <Alert>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        )
    }

    if (step === "create") {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Create Organization</CardTitle>
                        <CardDescription>
                            Enter your organization name to get started.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreateOrg}>
                            <div className="grid gap-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Organization Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="Acme Properties LLC"
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep("choice")}
                                        disabled={isLoading}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Organization
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return null
}
