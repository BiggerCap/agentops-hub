import Link from "next/link"
import { BrandLogo } from "@/components/ui/brand-logo"
import { Github, Linkedin, Globe, Facebook, Instagram } from "lucide-react"
import { SiX } from "react-icons/si"

const socialLinks = [
  { name: "GitHub", href: "https://github.com/akhundmuzzammil", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com/in/akhundmuzzammil", icon: Linkedin },
  { name: "X", href: "https://x.com/akhundmuzzammil", icon: SiX },
  { name: "Facebook", href: "https://facebook.com/akhundmuzzammil", icon: Facebook },
  { name: "Instagram", href: "https://instagram.com/akhundmuzzammil", icon: Instagram },
]

export function Footer() {
  return (
    <footer className="glass border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Centralized Content */}
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <BrandLogo size="lg" showText={true} />
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            AI-powered agent observability platform for building, monitoring, and controlling intelligent agents with real-time execution logs.
          </p>

          {/* Website */}
          <div className="mb-6">
            <Link
              href="https://akhundmuzzammil.com"
              target="_blank"
              className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium"
            >
              <Globe className="h-4 w-4" />
              akhundmuzzammil.com
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent"
                  title={item.name}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              )
            })}
          </div>

          {/* Copyright */}
          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AgentOps Hub by{" "}
              <Link 
                href="https://github.com/akhundmuzzammil" 
                target="_blank"
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                @akhundmuzzammil
              </Link>
              . All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
