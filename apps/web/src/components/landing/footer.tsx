import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-xl font-bold text-white">R</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight">RentEase</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Modern property management platform for the digital age.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Features</Link></li>
                            <li><Link href="#" className="hover:text-primary">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-primary">Security</Link></li>
                            <li><Link href="#" className="hover:text-primary">Roadmap</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">About</Link></li>
                            <li><Link href="#" className="hover:text-primary">Careers</Link></li>
                            <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                            <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                            <li><Link href="#" className="hover:text-primary">Terms</Link></li>
                            <li><Link href="#" className="hover:text-primary">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © 2024 RentEase Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        {/* Social links could go here */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
