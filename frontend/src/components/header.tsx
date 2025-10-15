"use client"
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ConnectionButton } from '@/app/connectButton'
import { useAccount } from 'wagmi'

const navLinks = [
  { name: 'Dashboard', path: '/dashboard', requiresAuth: true },
  { name: 'Marketplace', path: '/marketplace', requiresAuth: true },
  { name: 'My Tickets', path: '/tickets', requiresAuth: true },
  { name: 'Create Event', path: '/create-event', requiresAuth: true }
]

function Header() {
  const pathname = usePathname()
  const { isConnected } = useAccount()

  if (!isConnected) {
    return (
      <header className="bg-[#1a1a1a] backdrop-blur-md border-b border-[#dd7e9a]/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/EventBase-logo.png"
              alt="EventBase"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
              EventBase
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/dashboard" 
              className="text-slate-300 hover:text-[#dd7e9a] transition-colors font-medium"
            >
              Dashboard
            </Link>
            <Link 
              href="/resources" 
              className="text-slate-300 hover:text-[#dd7e9a] transition-colors font-medium"
            >
              Resources
            </Link>
            <Link 
              href="/#how-it-works" 
              className="text-slate-300 hover:text-[#dd7e9a] transition-colors font-medium"
            >
              How It Works
            </Link>
          </nav>

          <ConnectionButton />      
        </div>
      </header>
    )
  }

  // Filter navigation links based on auth status
  const filteredNavLinks = navLinks.filter(link => isConnected || !link.requiresAuth)

  return (
    <header className="bg-[#1a1a1a] backdrop-blur-md border-b border-[#dd7e9a]/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/EventBase-logo.png"
            alt="EventBase"
            width={40}
            height={40}
            className="rounded-full"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-[#dd7e9a] to-[#dd7e9a] bg-clip-text text-transparent">
            EventBase
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {filteredNavLinks.map((link) => {
            const isActive = pathname === link.path ||
              (link.path !== '/' && pathname.startsWith(link.path))

            return (
              <Link
                key={link.path}
                href={link.path}
                className={`${isActive
                    ? 'text-[#dd7e9a] font-medium'
                    : 'text-slate-300 hover:text-[#dd7e9a] transition-colors font-medium'
                  }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center space-x-4">
          <ConnectionButton />
        </div>
      </div>
    </header>
  )
}

export default Header