"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
            </div>

            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-headline mb-6"
                    >
                        Ready to modernize your property management?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-body-lg text-muted-foreground mb-10"
                    >
                        Join thousands of property managers who trust RentEase to streamline their operations.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link href="/auth/register">
                            <Button size="lg" className="h-12 px-8 text-base gap-2">
                                Get Started for Free
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
