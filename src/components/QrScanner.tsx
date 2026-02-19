import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { EMPTY_RESULT, useScanner } from '../hooks/useScanner'
import type { ScannerAdapter } from '../types'

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

const DEFAULT_LABELS: QrScannerLabels = {
  title: 'Отсканируйте QR-код',
  startButton: 'Запустить камеру',
  stopButton: 'Остановить',
  uploadButton: 'Сканировать из фото',
  base64Title: 'Base64 результат:',
  resultTitle: 'Результат:',
  copyButton: 'Скопировать',
  copiedButton: 'Скопировано!',
}

function QrScanner({
  labels,
  onResult,
  onError,
  autoStart = false,
  allowFileUpload = true,
  scannerAdapter,
  renderControls,
  renderResult,
  renderLayout,
}: QrScannerProps) {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels }

  const fileInputId = useId()
  const [rawCopied, setRawCopied] = useState(false)
  const [resultCopied, setResultCopied] = useState(false)
  const [rawCopiedTimeoutId, setRawCopiedTimeoutId] = useState<number | null>(null)
  const [resultCopiedTimeoutId, setResultCopiedTimeoutId] = useState<number | null>(null)

  const clearCopyTimeout = (timeoutId: number | null) => {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }
  }

  const {
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
  } = useScanner({ adapter: scannerAdapter })

  useEffect(() => {
    if (!autoStart) return
    void start()

    return () => {
      stop()
    }
  }, [autoStart, start, stop])

  useEffect(() => {
    if (!onResult || resultText === EMPTY_RESULT) return
    onResult({ text: resultText, base64: resultBase64 })
  }, [onResult, resultText, resultBase64])

  useEffect(() => {
    if (!onError || !error) return
    onError(error)
  }, [onError, error])

  useEffect(() => {
    return () => {
      clearCopyTimeout(rawCopiedTimeoutId)
      clearCopyTimeout(resultCopiedTimeoutId)
    }
  }, [rawCopiedTimeoutId, resultCopiedTimeoutId])

  const resetCopiedState = () => {
    setRawCopied(false)
    setResultCopied(false)
    setRawCopiedTimeoutId((previousId) => {
      clearCopyTimeout(previousId)
      return null
    })
    setResultCopiedTimeoutId((previousId) => {
      clearCopyTimeout(previousId)
      return null
    })
  }

  const handleStart = async () => {
    await start()
  }

  const handleStop = () => {
    stop()
    resetResult()
    resetCopiedState()
  }

  const handleClear = () => {
    resetResult()
    resetCopiedState()
  }

  const handleOpenFileDialog = () => {
    const input = document.getElementById(fileInputId)
    if (input instanceof HTMLInputElement) {
      input.click()
    }
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await scanFromFile(file)
    event.target.value = ''
  }

  const markCopied = (
    setter: (value: boolean) => void,
    setTimeoutId: Dispatch<SetStateAction<number | null>>,
  ) => {
    setter(true)
    setTimeoutId((previousId) => {
      clearCopyTimeout(previousId)
      return window.setTimeout(() => {
        setter(false)
        setTimeoutId(null)
      }, 2000)
    })
  }

  const handleCopyRaw = async () => {
    const ok = await copyText(resultBase64)
    if (ok) markCopied(setRawCopied, setRawCopiedTimeoutId)
  }

  const handleCopyResult = async () => {
    const ok = await copyText(resultText)
    if (ok) markCopied(setResultCopied, setResultCopiedTimeoutId)
  }

  const hasResult = resultText !== EMPTY_RESULT

  const renderFileInput = () => (
    <input
      id={fileInputId}
      type="file"
      accept="image/*"
      className="controls__file-input"
      onChange={handleFileChange}
    />
  )

  const renderApi: QrScannerRenderApi = {
    labels: mergedLabels,
    isRunning,
    hasResult,
    resultText,
    resultBase64,
    error,
    rawCopied,
    resultCopied,
    start: handleStart,
    stop: handleStop,
    clear: handleClear,
    openFileDialog: handleOpenFileDialog,
    copyRaw: handleCopyRaw,
    copyResult: handleCopyResult,
    renderFileInput,
  }

  const defaultControlsNode = (
    <div className="controls">
      <button
        type="button"
        className="controls-button btn-primary"
        onClick={handleStart}
        disabled={isRunning}
      >
        {mergedLabels.startButton}
      </button>

      <button
        type="button"
        className="controls-button btn-secondary"
        onClick={handleStop}
        disabled={!isRunning}
      >
        {mergedLabels.stopButton}
      </button>

      {allowFileUpload && (
        <>
          <button
            type="button"
            className="controls-button btn-primary"
            onClick={handleOpenFileDialog}
          >
            {mergedLabels.uploadButton}
          </button>

          {renderFileInput()}
        </>
      )}
    </div>
  )

  const defaultResultNode = (
    <div className="result">
      <div className="result__title">
        <strong>{mergedLabels.base64Title}</strong>
        <button
          type="button"
          className={`result-button controls-button btn-primary ${rawCopied ? 'is-copied' : ''}`}
          onClick={handleCopyRaw}
          disabled={!hasResult}
        >
          {rawCopied ? mergedLabels.copiedButton : mergedLabels.copyButton}
        </button>
      </div>
      <p className="result__raw">{resultBase64}</p>

      <div className="result__title">
        <strong>{mergedLabels.resultTitle}</strong>
        <button
          type="button"
          className={`result-button controls-button btn-primary ${resultCopied ? 'is-copied' : ''}`}
          onClick={handleCopyResult}
          disabled={!hasResult}
        >
          {resultCopied ? mergedLabels.copiedButton : mergedLabels.copyButton}
        </button>
      </div>
      <p className="result__text">{resultText}</p>
    </div>
  )

  const titleNode = <h2>{mergedLabels.title}</h2>

  const stageNode = (
    <div className="stage">
      <video ref={videoRef} className="stage__video" playsInline muted />
      <div className="stage__overlay" />
    </div>
  )

  const controlsNode = renderControls ? renderControls(renderApi) : defaultControlsNode
  const resultNode = renderResult ? renderResult(renderApi) : defaultResultNode
  const errorNode = error ? <p className="scanner-error">{error}</p> : null

  if (renderLayout) {
    return (
      <>
        {renderLayout(
          { title: titleNode, stage: stageNode, controls: controlsNode, result: resultNode, error: errorNode },
          renderApi,
        )}
      </>
    )
  }

  return (
    <main className="main-wrap">
      <div className="content">
        {titleNode}
        {stageNode}
      </div>

      {controlsNode}
      {errorNode}
      {resultNode}
    </main>
  )
}

export default QrScanner
