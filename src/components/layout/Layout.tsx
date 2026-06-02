import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="md:order-[-1]">
        <BottomNav />
      </div>
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
