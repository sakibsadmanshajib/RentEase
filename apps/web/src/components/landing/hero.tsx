"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Building2, Key, ShieldCheck } from "lucide-react"
import Link from "next/link"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm mb-8"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Now available for property managers
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
                    >
                        Modern Property Management <br />
                        <span className="text-primary">Reimagined</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
                    >
                        Streamline your rental operations with our all-in-one platform.
                        Automate billing, manage maintenance, and screen tenants with ease.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                    >
                        <Link href="/auth/register">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#demo">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                View Demo
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats / Trust Badges */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8 w-full"
                    >
                        {[
                            { label: "Active Units", value: "10k+" },
                            { label: "Transactions", value: "$50M+" },
                            { label: "Uptime", value: "99.9%" },
                            { label: "Support", value: "24/7" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-2xl font-bold text-white">{stat.value}</span>
                                <span className="text-sm text-muted-foreground">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
