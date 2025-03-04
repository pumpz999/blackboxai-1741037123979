import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWeb3React } from '@web3-react/core'
import type { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { Web3Provider } from '@ethersproject/providers'
import { ethers } from 'ethers'
import { Token } from '../types/token'
import TokenSelector from './TokenSelector'
import { createDexContract } from '../utils/dexContract'

interface LiquidityProviderProps {
  isOpen: boolean
  onClose: () => void
}

export default function LiquidityProvider({ isOpen, onClose }: LiquidityProviderProps) {
  const { account, active, library } = useWeb3React() as Web3ReactContextInterface<Web3Provider>
  const [token, setToken] = useState<Token | null>(null)
  const [ethAmount, setEthAmount] = useState('')
  const [tokenAmount, setTokenAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSelectingToken, setIsSelectingToken] = useState(false)
  const [shares, setShares] = useState('0')

  useEffect(() => {
    const fetchShares = async () => {
      if (!library || !token || !account) return

      try {
        const dexContract = createDexContract(process.env.NEXT_PUBLIC_DEX_CONTRACT_ADDRESS || '', library)
        const shares = await dexContract.getShares(token.address, account)
        setShares(ethers.utils.formatUnits(shares.toString(), 18))
      } catch (error) {
        console.error('Error fetching shares:', error)
      }
    }

    fetchShares()
  }, [library, token, account])

  const handleAddLiquidity = async () => {
    if (!library || !token || !ethAmount || !tokenAmount || !active) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dexContract = createDexContract(process.env.NEXT_PUBLIC_DEX_CONTRACT_ADDRESS || '', library)
      
      // First approve token transfer
      const tokenContract = new ethers.Contract(
        token.address,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        library.getSigner()
      )
      
      const approvalTx = await tokenContract.approve(
        process.env.NEXT_PUBLIC_DEX_CONTRACT_ADDRESS || '',
        ethers.utils.parseUnits(tokenAmount, token.decimals).toString()
      )
      await approvalTx.wait()

      // Add liquidity
      const tx = await dexContract.addLiquidity(
        token.address,
        tokenAmount,
        ethAmount
      )
      await tx.wait()

      // Clear inputs
      setEthAmount('')
      setTokenAmount('')
      setError(null)
      onClose()
    } catch (error) {
      console.error('Error adding liquidity:', error)
      setError(error instanceof Error ? error.message : 'Failed to add liquidity')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveLiquidity = async () => {
    if (!library || !token || !active) {
      setError('Please select a token')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const dexContract = createDexContract(process.env.NEXT_PUBLIC_DEX_CONTRACT_ADDRESS || '', library)
      const tx = await dexContract.removeLiquidity(
        token.address, 
        ethers.utils.parseUnits(shares, 18).toString()
      )
      await tx.wait()

      setShares('0')
      setError(null)
      onClose()
    } catch (error) {
      console.error('Error removing liquidity:', error)
      setError(error instanceof Error ? error.message : 'Failed to remove liquidity')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
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
        <h2 className="text-xl font-bold mb-4">Liquidity Provider</h2>

        {/* Token Selection */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Token</label>
          <button
            className="w-full p-3 rounded-lg button-glow bg-card-bg flex items-center justify-between"
            onClick={() => setIsSelectingToken(true)}
          >
            {token ? (
              <div className="flex items-center">
                <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full mr-2" />
                <span>{token.symbol}</span>
              </div>
            ) : (
              <span>Select Token</span>
            )}
          </button>
        </div>

        {/* ETH Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">ETH Amount</label>
          <input
            type="number"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="0.0"
            className="w-full p-3 rounded-lg bg-card-bg text-white placeholder-gray-400 outline-none"
          />
        </div>

        {/* Token Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">Token Amount</label>
          <input
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="0.0"
            className="w-full p-3 rounded-lg bg-card-bg text-white placeholder-gray-400 outline-none"
          />
        </div>

        {/* Shares Display */}
        {shares !== '0' && (
          <div className="mb-4 p-3 rounded-lg bg-card-bg">
            <div className="text-sm text-gray-400">Your Pool Shares</div>
            <div className="text-lg">{shares}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            className={`flex-1 py-3 rounded-lg text-lg font-semibold 
              ${active 
                ? 'bg-gradient-to-r from-neon-pink to-neon-blue button-glow' 
                : 'bg-gray-600 cursor-not-allowed'}`}
            whileHover={active ? { scale: 1.02 } : {}}
            whileTap={active ? { scale: 0.98 } : {}}
            onClick={handleAddLiquidity}
            disabled={!active || loading}
          >
            {loading ? 'Adding...' : 'Add Liquidity'}
          </motion.button>

          {shares !== '0' && (
            <motion.button
              className={`flex-1 py-3 rounded-lg text-lg font-semibold 
                ${active 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 button-glow' 
                  : 'bg-gray-600 cursor-not-allowed'}`}
              whileHover={active ? { scale: 1.02 } : {}}
              whileTap={active ? { scale: 0.98 } : {}}
              onClick={handleRemoveLiquidity}
              disabled={!active || loading}
            >
              {loading ? 'Removing...' : 'Remove Liquidity'}
            </motion.button>
          )}
        </div>

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
      </motion.div>

      {/* Token Selector Modal */}
      <TokenSelector
        isOpen={isSelectingToken}
        onClose={() => setIsSelectingToken(false)}
        onSelect={setToken}
        selectedToken={token}
      />
    </div>
  )
}
