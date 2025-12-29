import Link from "next/link"
import { Building2 } from "lucide-react"

const footerLinks = {
    Product: ["Features", "Pricing", "Security", "Roadmap"],
    Company: ["About", "Careers", "Blog", "Contact"],
    Legal: ["Privacy", "Terms", "Cookie Policy"],
}

export function Footer() {
    return (
        <footer className="border-t border-border py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                                <Building2 className="h-4 w-4 text-background" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">RentEase</span>
                        </Link>
                        <p className="text-body-sm text-muted-foreground">
                            Modern property management platform for the digital age.
                        </p>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-semibold mb-4">{category}</h4>
                            <ul className="space-y-2">
                                {links.map((link) => (
                                    <li key={link}>
                                        <Link
                                            href="#"
                                            className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-body-sm text-muted-foreground">
                        © {new Date().getFullYear()} RentEase Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}
