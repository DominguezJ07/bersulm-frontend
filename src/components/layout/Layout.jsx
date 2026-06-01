import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="bg-app text-app min-h-screen flex flex-col gap-0">
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
