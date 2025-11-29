"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Navbar() {
    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-md"
        >
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-xl font-bold text-white">R</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">RentEase</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <Link href="#about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        About
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Link href="/auth/login">
                        <Button variant="ghost" size="sm">
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
