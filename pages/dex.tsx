import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useWeb3React } from '@web3-react/core'
import type { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import NavBar from '../components/NavBar'
import TokenSelector from '../components/TokenSelector'
import { Token } from '../types/token'
import { createDexContract } from '../utils/dexContract'

export default function DEX() {
  const { account, active, library } = useWeb3React() as Web3ReactContextInterface<Web3Provider>
  const dexContract = useRef(library ? createDexContract(process.env.NEXT_PUBLIC_DEX_CONTRACT_ADDRESS || '', library) : null)
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [amount, setAmount] = useState('')
  const [estimatedOutput, setEstimatedOutput] = useState('0.0')
  const [loading, setLoading] = useState(false)
  const [autoTrigger, setAutoTrigger] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout>()
  const [isSelectingFrom, setIsSelectingFrom] = useState(false)
  const [isSelectingTo, setIsSelectingTo] = useState(false)

  // Initialize dexContract when library (provider) is available
  useEffect(() => {
    if (library) {
      dexContract.current = createDexContract(
        process.env.NEXT_PUBLIC_DEX_CONTRACT_ADDRESS || '',
        library
      )
    }
  }, [library])

  // Calculate estimated output amount when input changes
  useEffect(() => {
    const calculateOutput = async () => {
      if (!dexContract.current || !fromToken || !toToken || !amount || amount === '0') {
        setEstimatedOutput('0.0')
        return
      }

      try {
        const { tokenReserve, ethReserve } = await dexContract.current.getReserves(fromToken.address)
        const amountOut = await dexContract.current.getAmountOut(
          amount,
          tokenReserve,
          ethReserve
        )
        setEstimatedOutput(amountOut)
      } catch (error) {
        console.error('Error calculating output:', error)
        setEstimatedOutput('0.0')
      }
    }

    calculateOutput()
  }, [fromToken, toToken, amount])

  // Handle swap function
  const handleSwap = async () => {
    if (!fromToken || !toToken || !amount || !active || !dexContract.current) {
      setError('Please select tokens and enter amount')
      return
    }
    
    try {
      setLoading(true)
      setError(null)

      // Check if tokens are supported
      const isFromSupported = await dexContract.current.isSupportedToken(fromToken.address)
      const isToSupported = await dexContract.current.isSupportedToken(toToken.address)
      
      if (!isFromSupported || !isToSupported) {
        throw new Error('One or more tokens are not supported')
      }

      // Get reserves to calculate price impact
      const { tokenReserve, ethReserve } = await dexContract.current.getReserves(fromToken.address)
      
      // Calculate minimum amount out (with 1% slippage)
      const amountOut = await dexContract.current.getAmountOut(
        amount,
        tokenReserve,
        ethReserve
      )
      const minAmountOut = ethers.utils.formatUnits(
        ethers.utils.parseUnits(amountOut, 18)
          .mul(99)
          .div(100),
        18
      )

      // Execute swap
      if (fromToken.address === ethers.constants.AddressZero) {
        await dexContract.current.swapExactETHForTokens(
          toToken.address,
          minAmountOut,
          amount
        )
      } else if (toToken.address === ethers.constants.AddressZero) {
        await dexContract.current.swapExactTokensForETH(
          fromToken.address,
          amount,
          minAmountOut
        )
      } else {
        throw new Error('Direct token-to-token swaps not supported')
      }

      // Clear input
      setAmount('')
      setError(null)
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
    if (autoTrigger && active && fromToken && toToken && amount && !loading)  {
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
  }, [autoTrigger, active, fromToken, toToken, amount, loading, handleSwap])

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
                    value={estimatedOutput}
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
                  disabled={!active || loading}
                >
                  {autoTrigger ? 'On' : 'Off'}
                </motion.button>
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
