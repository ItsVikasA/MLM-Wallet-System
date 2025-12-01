'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Sparkles } from 'lucide-react'

interface SuccessCelebrationProps {
  show: boolean
  message: string
  onComplete?: () => void
}

export function SuccessCelebration({ show, message, onComplete }: SuccessCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; color: string }>>([])

  useEffect(() => {
    if (show) {
      // Generate confetti
      const newConfetti = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)],
      }))
      setConfetti(newConfetti)

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setConfetti([])
        if (onComplete) onComplete()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti */}
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {confetti.map((piece) => (
              <motion.div
                key={piece.id}
                initial={{ y: -20, x: `${piece.x}vw`, opacity: 1, rotate: 0 }}
                animate={{
                  y: '100vh',
                  rotate: 720,
                  opacity: 0,
                }}
                transition={{
                  duration: 2 + Math.random(),
                  ease: 'easeIn',
                }}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  backgroundColor: piece.color,
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>

          {/* Success Message */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 border-2 border-green-500">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: 2,
                }}
              >
                <CheckCircle className="h-16 w-16 text-green-500" />
              </motion.div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Success!
                </h3>
                <p className="text-gray-600 dark:text-gray-300">{message}</p>
              </div>
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
