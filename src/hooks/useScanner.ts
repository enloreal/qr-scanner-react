import { useCallback, useEffect, useRef, useState } from 'react'
import { createLazyZxingAdapter } from '../lazyZxingAdapter'
import { EMPTY_RESULT, type ScanResult, type ScannerAdapter } from '../types'

export { EMPTY_RESULT } from '../types'

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Неизвестная ошибка'
}

type UseScannerOptions = {
  adapter?: ScannerAdapter
}

export function useScanner(options?: UseScannerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [adapter] = useState<ScannerAdapter>(
    () => options?.adapter ?? createLazyZxingAdapter()
  )

  const [isRunning, setIsRunning] = useState(false)
  const [resultText, setResultText] = useState(EMPTY_RESULT)
  const [resultBase64, setResultBase64] = useState(EMPTY_RESULT)
  const [error, setError] = useState<string | null>(null)

  const setResult = useCallback((result: ScanResult) => {
    const text = result.text.trim()
    const base64 = result.base64.trim()

    if (!text) {
      setResultText(EMPTY_RESULT)
      setResultBase64(EMPTY_RESULT)
      return
    }

    setResultText(text)
    setResultBase64(base64 || EMPTY_RESULT)
    setError(null)
  }, [])

  const resetResult = useCallback(() => {
    setResultText(EMPTY_RESULT)
    setResultBase64(EMPTY_RESULT)
  }, [])

  const start = useCallback(async () => {
    const video = videoRef.current

    if (!video) {
      setError('Видеоэлемент не инициализирован')
      return
    }

    try {
      setError(null)
      await adapter.start(video, setResult)
      setIsRunning(true)
    } catch (err) {
      setIsRunning(false)
      setError(`Ошибка камеры: ${getErrorMessage(err)}`)
    }
  }, [adapter, setResult])

  const stop = useCallback(() => {
    adapter.stop()
    setIsRunning(false)
    setError(null)
  }, [adapter])

  const scanFromFile = useCallback(
    async (file: File) => {
      try {
        setError(null)
        const result = await adapter.scanFromFile(file)
        setResult(result)
      } catch (err) {
        setError(`Ошибка файла: ${getErrorMessage(err)}`)
      }
    },
    [adapter, setResult],
  )

  const copyText = useCallback(async (text: string): Promise<boolean> => {
    const normalized = text.trim()

    if (!normalized || normalized === EMPTY_RESULT) {
      return false
    }

    try {
      await navigator.clipboard.writeText(normalized)
      return true
    } catch {
      setError('Не удалось скопировать текст')
      return false
    }
  }, [])

  useEffect(() => {
    return () => {
      adapter.stop()
    }
  }, [adapter])

  return {
    videoRef,
    isRunning,
    resultText,
    resultBase64,
    error,
    start,
    stop,
    scanFromFile,
    copyText,
    resetResult,
  }
}
