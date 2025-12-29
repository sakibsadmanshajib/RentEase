"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32">
            {/* Subtle background gradient */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-muted/30 blur-[128px]" />
                <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-muted/20 blur-[128px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-sm text-muted-foreground mb-8"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/40" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-foreground" />
                        </span>
                        Now available for property managers
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-display gradient-text mb-6"
                    >
                        Modern Property Management{" "}
                        <span className="text-foreground">Reimagined</span>
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-body-lg text-muted-foreground mb-10 max-w-2xl"
                    >
                        Streamline your rental operations with our all-in-one platform.
                        Automate billing, manage maintenance, and screen tenants with ease.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <Link href="/auth/register">
                            <Button size="lg" className="h-12 px-8 text-base gap-2">
                                Start Free Trial
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#demo">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                View Demo
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-10 w-full"
                    >
                        {[
                            { label: "Active Units", value: "10k+" },
                            { label: "Transactions", value: "$50M+" },
                            { label: "Uptime", value: "99.9%" },
                            { label: "Support", value: "24/7" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-2xl md:text-3xl font-bold tracking-tight">{stat.value}</span>
                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
