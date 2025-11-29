import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
