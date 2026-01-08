/**
 * Mobile Navigation
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  Menu,
  LayoutDashboard,
  Bot,
  Database,
  Play,
  MessageSquare,
  Settings,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { name: 'Agents', href: '/app/agents', icon: Bot },
  { name: 'Knowledge Base', href: '/app/kb', icon: Database },
  { name: 'Runs', href: '/app/runs', icon: Play },
  { name: 'Conversations', href: '/app/conversations', icon: MessageSquare },
  { name: 'Settings', href: '/app/settings', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/app" className="flex items-center gap-2 font-bold text-xl" onClick={() => setOpen(false)}>
            <Bot className="h-6 w-6 text-primary" />
            <span>AgentOps</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
