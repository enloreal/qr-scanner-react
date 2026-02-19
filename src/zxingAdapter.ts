import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser'
import type { ScanResult, ScannerAdapter } from './types'

const toBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value)
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

const normalizeResult = (text: string): ScanResult => {
  const normalized = text.trim()
  return {
    text: normalized,
    base64: normalized ? toBase64(normalized) : '',
  }
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

export const createZxingAdapter = (): ScannerAdapter => {
  const reader = new BrowserMultiFormatReader()
  let controls: IScannerControls | null = null

  return {
    async start(video, onResult) {
      controls?.stop()
      controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        if (!result) return
        onResult(normalizeResult(result.getText()))
      })
    },

    stop() {
      controls?.stop()
      controls = null
    },

    async scanFromFile(file) {
      const image = await loadImage(file)
      const result = await reader.decodeFromImageElement(image)
      return normalizeResult(result.getText())
    },
  }
}
