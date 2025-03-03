import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Token } from '../types/token'

interface TokenSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (token: Token) => void
  selectedToken?: Token | null
}

// Sample tokens for demonstration
const sampleTokens: Token[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    address: '0x0000000000000000000000000000000000000000',
    chainId: 1,
    decimals: 18,
    logoURI: 'https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/6ed5f/eth-diamond-black.png'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    chainId: 1,
    decimals: 6,
    logoURI: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
  },
  {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    chainId: 1,
    decimals: 8,
    logoURI: 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png'
  }
]

export default function TokenSelector({ isOpen, onClose, onSelect, selectedToken }: TokenSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTokens, setFilteredTokens] = useState(sampleTokens)

  useEffect(() => {
    const filtered = sampleTokens.filter(token => 
      token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      token.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredTokens(filtered)
  }, [searchTerm])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        <motion.div
          className="relative z-50 w-full max-w-md p-6 glass-panel rounded-2xl"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
        >
          <h2 className="text-xl font-bold mb-4">Select Token</h2>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by name or paste address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 mb-4 rounded-lg bg-card-bg text-white placeholder-gray-400 outline-none"
          />

          {/* Token List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredTokens.map((token) => (
              <motion.button
                key={token.address}
                className={`w-full p-3 mb-2 rounded-lg flex items-center justify-between hover:bg-card-bg transition-colors
                  ${selectedToken?.address === token.address ? 'bg-card-bg border border-neon-blue' : ''}`}
                onClick={() => {
                  onSelect(token)
                  onClose()
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center">
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full mr-3"
                  />
                  <div className="text-left">
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-gray-400">{token.name}</div>
                  </div>
                </div>
                {selectedToken?.address === token.address && (
                  <div className="text-neon-blue">Selected</div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
