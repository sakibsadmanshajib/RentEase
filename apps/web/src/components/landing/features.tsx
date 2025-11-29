"use client"

import { motion } from "framer-motion"
import { Building2, CreditCard, Users, Shield, Zap, BarChart3 } from "lucide-react"

const features = [
    {
        icon: Building2,
        title: "Property Management",
        description: "Track all your properties, units, and leases in one centralized dashboard.",
    },
    {
        icon: Users,
        title: "Tenant Portal",
        description: "Give tenants a modern experience to pay rent, request maintenance, and view documents.",
    },
    {
        icon: CreditCard,
        title: "Automated Billing",
        description: "Set up recurring invoices, late fees, and payment reminders automatically.",
    },
    {
        icon: Shield,
        title: "Secure Screening",
        description: "Run comprehensive background and credit checks with a single click.",
    },
    {
        icon: Zap,
        title: "Maintenance Requests",
        description: "Streamline work orders with real-time tracking and vendor management.",
    },
    {
        icon: BarChart3,
        title: "Financial Reports",
        description: "Generate detailed profit & loss statements and tax reports instantly.",
    },
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Everything you need to run your portfolio
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Powerful tools designed to help you scale your property management business without the headache.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-background border border-white/5 hover:border-primary/50 transition-colors group"
                        >
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                <feature.icon className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
