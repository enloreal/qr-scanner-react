import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { EMPTY_RESULT, useScanner } from '../hooks/useScanner'

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

export type QrScannerProps = {
  labels?: Partial<QrScannerLabels>
  onResult?: (payload: { text: string; base64: string }) => void
  onError?: (message: string) => void
  autoStart?: boolean
  allowFileUpload?: boolean
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
}: QrScannerProps) {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels }

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [rawCopied, setRawCopied] = useState(false)
  const [resultCopied, setResultCopied] = useState(false)

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
  } = useScanner()

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

  const handleStart = async () => {
    await start()
  }

  const handleStop = () => {
    stop()
    resetResult()
    setRawCopied(false)
    setResultCopied(false)
  }

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await scanFromFile(file)
    event.target.value = ''
  }

  const markCopied = (setter: (value: boolean) => void) => {
    setter(true)
    window.setTimeout(() => setter(false), 2000)
  }

  const handleCopyRaw = async () => {
    const ok = await copyText(resultBase64)
    if (ok) markCopied(setRawCopied)
  }

  const handleCopyResult = async () => {
    const ok = await copyText(resultText)
    if (ok) markCopied(setResultCopied)
  }

  const hasResult = resultText !== EMPTY_RESULT

  return (
    <main className="main-wrap">
      <div className="content">
        <h2>{mergedLabels.title}</h2>

        <div className="stage">
          <video ref={videoRef} className="stage__video" playsInline muted />
          <div className="stage__overlay" />
        </div>
      </div>

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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="controls__file-input"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>

      {error && <p className="scanner-error">{error}</p>}

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
        <p id="raw-result">{resultBase64}</p>

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
        <p id="result">{resultText}</p>
      </div>
    </main>
  )
}

export default QrScanner
