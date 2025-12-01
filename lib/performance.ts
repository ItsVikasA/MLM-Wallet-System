/**
 * Performance monitoring utilities
 */

export function measurePerformance(name: string, fn: () => void) {
  if (typeof window === 'undefined') return

  const start = performance.now()
  fn()
  const end = performance.now()
  
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  if (typeof window === 'undefined') return fn()

  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`)
  return result
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service
    console.log(metric)
  }
}

/**
 * Prefetch data for better performance
 */
export function prefetchData(url: string) {
  if (typeof window === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = url
  document.head.appendChild(link)
}

/**
 * Lazy load component with retry logic
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return React.lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        return await componentImport()
      } catch (error) {
        if (i === retries - 1) throw error
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
    throw new Error('Failed to load component')
  })
}

import React from 'react'
