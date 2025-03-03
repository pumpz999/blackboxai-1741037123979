import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import NavBar from '../components/NavBar'
import TokenSelector from '../components/TokenSelector'
import { Token } from '../types/token'

export default function DEX() {
  const { account, isActive } = useWeb3React<Web3Provider>()
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [autoTrigger, setAutoTrigger] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const [isSelectingFrom, setIsSelectingFrom] = useState(false)
  const [isSelectingTo, setIsSelectingTo] = useState(false)

  // Handle swap function
  const handleSwap = async () => {
    if (!fromToken || !toToken || !amount || !isActive) {
      setError('Please select tokens and enter amount')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      // Swap logic will be implemented here
      console.log('Swapping tokens...')
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate swap
    } catch (error) {
      console.error('Swap failed:', error)
      setError(error instanceof Error ? error.message : 'Swap failed')
    } finally {
      setLoading(false)
    }
  }

  // Auto-trigger effect
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    // Check if auto-trigger is enabled and conditions are met
    if (autoTrigger && isActive && fromToken && toToken && amount && !loading) {
      // Set a timer to avoid rapid triggers
      timerRef.current = setTimeout(() => {
        handleSwap()
      }, 1000) // 1 second delay
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [autoTrigger, isActive, fromToken, toToken, amount, loading, handleSwap])

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
                    onClick={() => setIsSelectingFrom(true)}
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
                    onClick={() => setIsSelectingTo(true)}
                  >
                    {toToken ? toToken.symbol : 'Select'}
                  </button>
                </div>
              </div>

              {/* Auto Trigger Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400">Auto Swap</span>
                <motion.button
                  className={`px-4 py-2 rounded-lg text-sm font-semibold 
                    ${autoTrigger 
                      ? 'bg-gradient-to-r from-neon-pink to-neon-blue button-glow' 
                      : 'bg-card-bg'}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAutoTrigger(!autoTrigger)}
                  disabled={!isActive || loading}
                >
                  {autoTrigger ? 'On' : 'Off'}
                </motion.button>
              </div>

              {/* Swap Button */}
              <motion.button
                className={`w-full py-4 rounded-lg text-lg font-semibold 
                  ${isActive 
                    ? 'bg-gradient-to-r from-neon-pink to-neon-blue button-glow' 
                    : 'bg-gray-600 cursor-not-allowed'}`}
                whileHover={isActive ? { scale: 1.02 } : {}}
                whileTap={isActive ? { scale: 0.98 } : {}}
                onClick={handleSwap}
                disabled={!isActive || loading}
              >
                {!isActive 
                  ? 'Connect Wallet' 
                  : loading 
                    ? 'Swapping...' 
                    : 'Swap'}
              </motion.button>

              {/* Error Message */}
              {error && (
                <motion.div
                  className="mt-4 p-4 rounded-lg bg-red-500 bg-opacity-20 text-red-400 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

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

      {/* Token Selectors */}
      <TokenSelector
        isOpen={isSelectingFrom}
        onClose={() => setIsSelectingFrom(false)}
        onSelect={setFromToken}
        selectedToken={fromToken}
      />
      <TokenSelector
        isOpen={isSelectingTo}
        onClose={() => setIsSelectingTo(false)}
        onSelect={setToToken}
        selectedToken={toToken}
      />
    </div>
  )
}
