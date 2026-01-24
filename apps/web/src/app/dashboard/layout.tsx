import { DashboardNavbar } from "@/components/dashboard/navbar"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { TenantProvider } from "@/contexts/tenant-context"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <TenantProvider>
            <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
                <div className="hidden border-r bg-muted/40 lg:block">
                    <DashboardSidebar />
                </div>
                <div className="flex flex-col">
                    <DashboardNavbar />
                    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                        {children}
                    </main>
                </div>
            </div>
        </TenantProvider>
    )
}
