"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Building2 } from "lucide-react"

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 glass"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                        <Building2 className="h-4 w-4 text-background" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">RentEase</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {["Features", "Pricing", "About"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                            Log in
                        </Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button size="sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </motion.header>
    )
}
