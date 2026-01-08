import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { DemoSection } from "@/components/landing/demo-section"
import { ArchitectureSection } from "@/components/landing/architecture-section"
import { TechStack } from "@/components/landing/tech-stack"
import { Footer } from "@/components/landing/footer"

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background blobs - present throughout the page */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/30 dark:bg-purple-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-pink-500/30 dark:bg-pink-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-40 left-1/3 w-96 h-96 bg-blue-500/30 dark:bg-blue-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] animate-blob animation-delay-4000" />
      </div>

      <Navbar />
      <main>
        <Hero />
        <DemoSection />
        <ArchitectureSection />
        <TechStack />
      </main>
      <Footer />
    </div>
  )
}