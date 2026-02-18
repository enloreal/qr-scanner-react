import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'

export const EMPTY_RESULT = '—'

const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Неизвестная ошибка'
}

const loadImage = (file: File): Promise<HTMLImageElement> => {
  const url = URL.createObjectURL(file)

  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Не удалось загрузить изображение'))
    }

    image.src = url
  })
}

export function useScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const controlsRef = useRef<IScannerControls | null>(null)

  const [isRunning, setIsRunning] = useState(false)
  const [resultText, setResultText] = useState(EMPTY_RESULT)
  const [resultBase64, setResultBase64] = useState(EMPTY_RESULT)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader()

    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [])

  const setResult = useCallback((text: string) => {
    const normalized = text.trim()

    if (!normalized) {
      setResultText(EMPTY_RESULT)
      setResultBase64(EMPTY_RESULT)
      return
    }

    setResultText(normalized)
    setResultBase64(toBase64(normalized))
    setError(null)
  }, [])

  const resetResult = useCallback(() => {
    setResultText(EMPTY_RESULT)
    setResultBase64(EMPTY_RESULT)
  }, [])

  const start = useCallback(async () => {
    const video = videoRef.current
    const reader = readerRef.current

    if (!video || !reader) {
      setError('Видеоэлемент или сканер не инициализирован')
      return
    }

    try {
      setError(null)

      controlsRef.current?.stop()
      controlsRef.current = null

      const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        if (result) {
          setResult(result.getText())
        }
      })

      controlsRef.current = controls
      setIsRunning(true)
    } catch (err) {
      setIsRunning(false)
      setError(`Ошибка камеры: ${getErrorMessage(err)}`)
    }
  }, [setResult])

  const stop = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setIsRunning(false)
    setError(null)
  }, [])

  const scanFromFile = useCallback(async (file: File) => {
    const reader = readerRef.current

    if (!reader) {
      setError('Сканер не инициализирован')
      return
    }

    try {
      setError(null)

      const image = await loadImage(file)
      const result = await reader.decodeFromImageElement(image)
      setResult(result.getText())
    } catch (err) {
      setError(`Ошибка файла: ${getErrorMessage(err)}`)
    }
  }, [setResult])

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
