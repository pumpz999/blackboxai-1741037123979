import { useWeb3React } from '@web3-react/core'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

interface NavItem {
  name: string
  path: string
  gradient: string
}

const navItems: NavItem[] = [
  { name: 'DEX', path: '/dex', gradient: 'from-neon-pink to-neon-purple' },
  { name: 'DeFi', path: '/defi', gradient: 'from-neon-blue to-neon-yellow' },
  { name: 'Games', path: '/games', gradient: 'from-neon-purple to-neon-blue' }
]

export default function NavBar() {
  const { account, active } = useWeb3React()
  const [isOpen, setIsOpen] = useState(false)

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <nav className="fixed w-full z-50 glass-panel backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="text-2xl font-bold neon-text cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              CC
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link href={item.path} key={item.name}>
                <motion.div
                  className="relative cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.name}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Wallet Status */}
          <div className="hidden md:block">
            {active && account ? (
              <motion.div
                className="glass-panel px-4 py-2 rounded-full text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {truncateAddress(account)}
              </motion.div>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link href={item.path} key={item.name}>
                <motion.div
                  className={`block px-3 py-2 rounded-md text-base font-medium 
                    bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </nav>
  )
}
