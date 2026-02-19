import type { ScanResult, ScannerAdapter } from './types'

type MockOptions = {
  resultText?: string
  intervalMs?: number
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

const makeResult = (text: string): ScanResult => {
  const normalized = text.trim()
  return {
    text: normalized,
    base64: normalized ? toBase64(normalized) : '',
  }
}

export const createMockScannerAdapter = (options?: MockOptions): ScannerAdapter => {
  const resultText = options?.resultText ?? 'MOCK-QR-TEST-12345'
  const intervalMs = options?.intervalMs ?? 3000

  let timerId: number | null = null

  return {
    async start(_video, onResult) {
      if (timerId !== null) {
        window.clearInterval(timerId)
      }

      await wait(250)
      onResult(makeResult(resultText))

      timerId = window.setInterval(() => {
        onResult(makeResult(resultText))
      }, intervalMs)
    },

    stop() {
      if (timerId !== null) {
        window.clearInterval(timerId)
        timerId = null
      }
    },

    async scanFromFile(file) {
      await wait(300)
      return makeResult(`MOCK-FILE:${file.name}`)
    },
  }
}
