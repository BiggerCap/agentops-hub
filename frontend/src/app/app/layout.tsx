/**
 * Dashboard Layout
 * Protected layout for authenticated users
 */

'use client'

import { ProtectedRoute } from '@/lib/authContext'
import { Sidebar } from '@/components/layout/sidebar'
import { UserNav } from '@/components/layout/user-nav'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex h-16 items-center justify-between border-b px-6 md:ml-64">
            <MobileNav />
            <div className="flex-1" />
            <UserNav />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/10 md:ml-64">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
