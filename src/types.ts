export const EMPTY_RESULT = '—'

export type ScanResult = {
  text: string
  base64: string
}

export type ScannerAdapter = {
  start: (
    video: HTMLVideoElement,
    onResult: (result: ScanResult) => void,
  ) => Promise<void>
  stop: () => void
  scanFromFile: (file: File) => Promise<ScanResult>
}
