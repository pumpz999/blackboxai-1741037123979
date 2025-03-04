import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import '../styles/globals.css'

// Web3 imports
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

// Get Web3 Provider
function getLibrary(provider: any) {
  return new Web3Provider(provider)
}

export default function App({ Component, pageProps, router }: AppProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for smooth transitions
    setTimeout(() => setIsLoading(false), 500)
  }, [])

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AnimatePresence mode='wait'>
        {isLoading ? (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-neon-blue text-2xl font-bold animate-pulse-glow">
              Crypto Carnival
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={router.route}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Component {...pageProps} />
          </motion.div>
        )}
      </AnimatePresence>
    </Web3ReactProvider>
  )
}
