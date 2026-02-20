import type { ReactNode } from 'react'
import type { ScannerAdapter } from '../../types'

export type QrScannerLabels = {
  title: string
  startButton: string
  stopButton: string
  uploadButton: string
  base64Title: string
  resultTitle: string
  copyButton: string
  copiedButton: string
}

export type QrScannerRenderApi = {
  labels: QrScannerLabels
  isRunning: boolean
  hasResult: boolean
  resultText: string
  resultBase64: string
  error: string | null
  rawCopied: boolean
  resultCopied: boolean
  start: () => Promise<void>
  stop: () => void
  clear: () => void
  openFileDialog: () => void
  copyRaw: () => Promise<void>
  copyResult: () => Promise<void>
  renderFileInput: () => ReactNode
}

export type QrScannerLayoutParts = {
  title: ReactNode
  stage: ReactNode
  controls: ReactNode
  result: ReactNode
  error: ReactNode
}

export type QrScannerProps = {
  labels?: Partial<QrScannerLabels>
  onResult?: (payload: { text: string; base64: string }) => void
  onError?: (message: string) => void
  autoStart?: boolean
  allowFileUpload?: boolean
  scannerAdapter?: ScannerAdapter
  renderControls?: (api: QrScannerRenderApi) => ReactNode
  renderResult?: (api: QrScannerRenderApi) => ReactNode
  renderLayout?: (parts: QrScannerLayoutParts, api: QrScannerRenderApi) => ReactNode
}
