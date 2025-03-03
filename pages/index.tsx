import { motion } from 'framer-motion'
import { useWeb3React } from '@web3-react/core'
import { useState } from 'react'
import Link from 'next/link'

// Components will be created next
import WalletSelector from '../components/WalletSelector'
import NavBar from '../components/NavBar'

export default function Home() {
  const { active } = useWeb3React()
  const [isHovering, setIsHovering] = useState('')

  const features = [
    {
      id: 'dex',
      title: 'Cross-Chain DEX',
      description: 'Swap tokens seamlessly across multiple blockchains',
      path: '/dex',
      gradient: 'from-neon-pink to-neon-purple'
    },
    {
      id: 'defi',
      title: 'DeFi Platform',
      description: 'Stake, farm yields, and earn rewards',
      path: '/defi',
      gradient: 'from-neon-blue to-neon-yellow'
    },
    {
      id: 'games',
      title: 'Blockchain Games',
      description: 'Play provably fair games and win crypto',
      path: '/games',
      gradient: 'from-neon-purple to-neon-blue'
    }
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      <NavBar />
      
      {/* Hero Section */}
      <motion.div 
        className="container mx-auto px-4 pt-20 pb-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center mb-16">
          <motion.h1 
            className="text-6xl font-bold neon-text mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Crypto Carnival
          </motion.h1>
          <p className="text-xl text-gray-300 mb-8">
            Your Gateway to Decentralized Finance & Entertainment
          </p>
          
          {!active && <WalletSelector />}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature) => (
            <Link href={feature.path} key={feature.id}>
              <motion.div
                className="glass-panel p-6 interactive-card cursor-pointer"
                onHoverStart={() => setIsHovering(feature.id)}
                onHoverEnd={() => setIsHovering('')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`h-2 w-20 mb-4 rounded bg-gradient-to-r ${feature.gradient}`} />
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                
                {isHovering === feature.id && (
                  <motion.div
                    className="mt-4 text-sm text-neon-blue"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Explore →
                  </motion.div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500">
        <p>Built with ❤️ by Crypto Carnival Team</p>
      </footer>
    </div>
  )
}
