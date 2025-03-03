import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWeb3React } from '@web3-react/core'
import NavBar from '../components/NavBar'

interface Token {
  symbol: string
  name: string
  address: string
  chainId: number
  decimals: number
  logoURI: string
}

export default function DEX() {
  const { active, account } = useWeb3React()
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSwap = async () => {
    if (!fromToken || !toToken || !amount || !active) return
    
    try {
      setLoading(true)
      // Swap logic will be implemented here
      console.log('Swapping tokens...')
    } catch (error) {
      console.error('Swap failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <NavBar />
      
      <div className="container mx-auto px-4 pt-24">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-panel p-6 rounded-xl">
            <h1 className="text-3xl font-bold mb-6 neon-text text-center">
              Cross-Chain DEX
            </h1>

            {/* Swap Interface */}
            <div className="space-y-4">
              {/* From Token */}
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">From</span>
                  {account && (
                    <span className="text-sm text-gray-400">
                      Balance: {fromToken ? '0.00' : '-'}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent text-2xl outline-none"
                  />
                  <button
                    className="ml-2 px-4 py-2 rounded-lg button-glow bg-card-bg"
                    onClick={() => console.log('Select token')}
                  >
                    {fromToken ? fromToken.symbol : 'Select'}
                  </button>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <motion.button
                  className="w-10 h-10 rounded-full button-glow bg-card-bg flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    const temp = fromToken
                    setFromToken(toToken)
                    setToToken(temp)
                  }}
                >
                  ↓
                </motion.button>
              </div>

              {/* To Token */}
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">To</span>
                  {account && (
                    <span className="text-sm text-gray-400">
                      Balance: {toToken ? '0.00' : '-'}
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={'0.0'}
                    disabled
                    placeholder="0.0"
                    className="w-full bg-transparent text-2xl outline-none"
                  />
                  <button
                    className="ml-2 px-4 py-2 rounded-lg button-glow bg-card-bg"
                    onClick={() => console.log('Select token')}
                  >
                    {toToken ? toToken.symbol : 'Select'}
                  </button>
                </div>
              </div>

              {/* Swap Button */}
              <motion.button
                className={`w-full py-4 rounded-lg text-lg font-semibold 
                  ${active 
                    ? 'bg-gradient-to-r from-neon-pink to-neon-blue button-glow' 
                    : 'bg-gray-600 cursor-not-allowed'}`}
                whileHover={active ? { scale: 1.02 } : {}}
                whileTap={active ? { scale: 0.98 } : {}}
                onClick={handleSwap}
                disabled={!active || loading}
              >
                {!active 
                  ? 'Connect Wallet' 
                  : loading 
                    ? 'Swapping...' 
                    : 'Swap'}
              </motion.button>

              {/* Price Info */}
              {fromToken && toToken && (
                <div className="mt-4 p-4 glass-panel rounded-lg">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Price Impact</span>
                    <span>{'< 0.1%'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>Route</span>
                    <span>{`${fromToken.symbol} → ${toToken.symbol}`}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
