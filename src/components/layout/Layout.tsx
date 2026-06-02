import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col gap-0 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="md:order-[-1]">
        <BottomNav />
      </div>
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
