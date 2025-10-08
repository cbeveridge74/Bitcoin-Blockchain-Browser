import { create } from 'zustand'
import { fetchLatestAndPreviousBlockDetails, BlockDetails, TwoBlocks } from '@/api/blockchain'

type State = {
  block: BlockDetails | null
  loading: boolean
  error: string | null
  previousBlock: BlockDetails | null
  refresh: () => Promise<void>
  startPolling: (ms: number) => void
  stopPolling: () => void
}

const useBlockchain = create<State>((set, get) => {
  let timer: ReturnType<typeof setInterval> | null = null
  const STORAGE_KEY = 'btc-browser:lastBlock'

  // try to restore from localStorage
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw)
      // initialize state with persisted values
      set({ block: parsed.block ?? null, previousBlock: parsed.previousBlock ?? null })
    }
  } catch (e) {
    // ignore parse errors
  }

  return {
    block: null,
    loading: false,
    error: null,
    previousBlock: null,
    refresh: async () => {
      set({ loading: true, error: null })
      try {
        const result: TwoBlocks = await fetchLatestAndPreviousBlockDetails()
        set({ block: result.current, previousBlock: result.previous })
        // persist
        try {
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ block: result.current, previousBlock: result.previous }))
          }
        } catch (e) {
          // ignore storage errors
        }
      } catch (err: any) {
        set({ error: err?.message || String(err) })
      } finally {
        set({ loading: false })
      }
    },
    startPolling: (ms: number) => {
      if (timer) return
      timer = setInterval(() => {
        get().refresh().catch(() => {})
      }, ms)
    },
    stopPolling: () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }
  }
})

export default useBlockchain
