import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import { motion } from 'framer-motion'
import { useState } from 'react'

// Initialize connectors for different chains
const injected = new InjectedConnector({
  supportedChainIds: [1, 56, 137, 43114] // Ethereum, BSC, Polygon, Avalanche
})

interface WalletOption {
  name: string
  icon: string
  connector: any
}

const wallets: WalletOption[] = [
  {
    name: 'MetaMask',
    icon: '🦊',
    connector: injected
  },
  {
    name: 'WalletConnect',
    icon: '🔗',
    connector: injected // Replace with WalletConnect connector when implemented
  }
]

export default function WalletSelector() {
  const { activate, active, error } = useWeb3React()
  const [connecting, setConnecting] = useState('')

  const connectWallet = async (wallet: WalletOption) => {
    try {
      setConnecting(wallet.name)
      await activate(wallet.connector)
    } catch (err) {
      console.error('Failed to connect wallet:', err)
    } finally {
      setConnecting('')
    }
  }

  return (
    <motion.div
      className="glass-panel p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4 neon-text text-center">
        Connect Your Wallet
      </h3>
      
      <div className="space-y-3">
        {wallets.map((wallet) => (
          <motion.button
            key={wallet.name}
            className={`w-full p-4 rounded-lg button-glow 
              ${connecting === wallet.name ? 'bg-card-bg' : 'bg-dark-bg'}
              ${error ? 'border-red-500' : 'border-gray-700'}
              border transition-all duration-200 hover:border-neon-blue
              flex items-center justify-between`}
            onClick={() => connectWallet(wallet)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={connecting !== '' || active}
          >
            <span className="flex items-center">
              <span className="text-2xl mr-3">{wallet.icon}</span>
              <span className="font-medium">{wallet.name}</span>
            </span>
            {connecting === wallet.name && (
              <div className="loading-spinner w-5 h-5 border-2" />
            )}
          </motion.button>
        ))}
      </div>

      {error && (
        <motion.p
          className="mt-4 text-red-500 text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Failed to connect. Please try again.
        </motion.p>
      )}
    </motion.div>
  )
}
