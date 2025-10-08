import React, { useEffect, useState } from 'react'
import useBlockchain from '@/store/useBlockchain'
import ThemeToggle from '@/components/ThemeToggle'

export default function App() {
  const { block, previousBlock, loading, error, refresh, startPolling, stopPolling } = useBlockchain()

  const THEME_KEY = 'btc-browser:theme'
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null
      return raw === 'dark' ? 'dark' : 'light'
    } catch (e) {
      return 'light'
    }
  })

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (theme === 'dark') document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
      }
      if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, theme)
    } catch (e) {}
  }, [theme])

  useEffect(() => {
    // initial fetch
    refresh()
    // poll every 30 seconds
    startPolling(30_000)
    return () => stopPolling()
  }, [refresh, startPolling, stopPolling])

  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    // highlight when block changes
    if (!block) return
    setHighlight(true)
    const t = setTimeout(() => setHighlight(false), 1200)
    return () => clearTimeout(t)
  }, [block?.id])

  const timeDelta =
    block && previousBlock ? Math.abs(block.timestamp - previousBlock.timestamp) : null
  const txDelta = block && previousBlock && typeof block.tx_count === 'number' && typeof previousBlock.tx_count === 'number'
    ? block.tx_count - previousBlock.tx_count
    : null

  return (
    <div className={`app ${highlight ? 'highlight' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Bitcoin Blockchain Browser</h1>
        <ThemeToggle />
      </div>

      {error ? (
        <div role="alert">Error: {error}</div>
      ) : (
        <>
          <p>
            Latest block height: {loading ? 'Loading...' : block ? block.height : 'Unknown'}
          </p>
          {block && (
            <>
              <h2>Current Block</h2>
              <ul>
                <li>Block ID: {block.id}</li>
                <li>Timestamp: {new Date(block.timestamp * 1000).toLocaleString()}</li>
                <li>Tx count: {block.tx_count ?? 'N/A'}</li>
                {timeDelta !== null && <li>Δ time: {timeDelta}s</li>}
                {txDelta !== null && <li>Δ tx: {txDelta >= 0 ? `+${txDelta}` : txDelta}</li>}
              </ul>
            </>
          )}

          {previousBlock && (
            <>
              <h2>Previous Block</h2>
              <ul>
                <li>Block ID: {previousBlock.id}</li>
                <li>Timestamp: {new Date(previousBlock.timestamp * 1000).toLocaleString()}</li>
                <li>Tx count: {previousBlock.tx_count ?? 'N/A'}</li>
              </ul>
            </>
          )}
          <div>
            <button onClick={refresh}>Refresh</button>
          </div>
        </>
      )}
    </div>
  )
}
