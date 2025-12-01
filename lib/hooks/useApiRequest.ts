import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseApiRequestOptions {
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  maxRetries?: number
}

export function useApiRequest<T = any>(
  requestFn: () => Promise<Response>,
  options: UseApiRequestOptions = {}
) {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage = 'Operation successful',
    maxRetries = 3,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const execute = useCallback(
    async (retryAttempt = 0) => {
      setLoading(true)
      setError(null)

      try {
        const response = await requestFn()

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Request failed with status ${response.status}`)
        }

        const result = await response.json()
        setData(result)

        if (showSuccessToast) {
          toast.success(successMessage)
        }

        if (onSuccess) {
          onSuccess(result)
        }

        setRetryCount(0)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred')
        setError(error)

        if (retryAttempt < maxRetries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
          setRetryCount(retryAttempt + 1)
          return execute(retryAttempt + 1)
        }

        if (showErrorToast) {
          toast.error('Request failed', {
            description: error.message,
          })
        }

        if (onError) {
          onError(error)
        }

        throw error
      } finally {
        setLoading(false)
      }
    },
    [requestFn, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, maxRetries]
  )

  const retry = useCallback(() => {
    setRetryCount(0)
    return execute()
  }, [execute])

  return {
    data,
    loading,
    error,
    execute,
    retry,
    retryCount,
  }
}
