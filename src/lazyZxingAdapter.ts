import type { ScannerAdapter } from './types'

export const createLazyZxingAdapter = (): ScannerAdapter => {
  let loadedAdapter: ScannerAdapter | null = null
  let loadingPromise: Promise<ScannerAdapter> | null = null

  const ensureAdapter = async (): Promise<ScannerAdapter> => {
    if (loadedAdapter) {
      return loadedAdapter
    }

    if (!loadingPromise) {
      loadingPromise = import('./zxingAdapter').then(({ createZxingAdapter }) => {
        loadedAdapter = createZxingAdapter()
        return loadedAdapter
      })
    }

    return loadingPromise
  }

  return {
    async start(video, onResult) {
      const adapter = await ensureAdapter()
      await adapter.start(video, onResult)
    },

    stop() {
      loadedAdapter?.stop()
    },

    async scanFromFile(file) {
      const adapter = await ensureAdapter()
      return adapter.scanFromFile(file)
    },
  }
}
