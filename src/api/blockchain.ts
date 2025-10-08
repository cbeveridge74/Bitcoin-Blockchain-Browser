// Fetch latest block height from a public block explorer REST API.
// By default this uses Blockstream's API: https://blockstream.info/api
// You can override the base URL with the Vite env var VITE_BLOCKSTREAM_API_BASE.
export async function fetchLatestBlockHeight(timeoutMs = 5000): Promise<number> {
  const base = (import.meta as any).env?.VITE_BLOCKSTREAM_API_BASE || 'https://blockstream.info/api'
  const url = `${base.replace(/\/$/, '')}/blocks/tip/height`

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Failed to fetch latest block height: ${res.status} ${res.statusText}`)
    const text = await res.text()
    const n = Number(text.trim())
    if (!Number.isFinite(n)) throw new Error('Invalid block height response')
    return n
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out')
    throw err
  } finally {
    clearTimeout(id)
  }
}

export type BlockDetails = {
  id: string
  height: number
  timestamp: number
  tx_count?: number
}

export async function fetchLatestBlockDetails(timeoutMs = 5000): Promise<BlockDetails> {
  const base = (import.meta as any).env?.VITE_BLOCKSTREAM_API_BASE || 'https://blockstream.info/api'
  const b = base.replace(/\/$/, '')

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // first get the latest block hash
    const hashRes = await fetch(`${b}/blocks/tip/hash`, { signal: controller.signal })
    if (!hashRes.ok) throw new Error(`Failed to fetch latest block hash: ${hashRes.status} ${hashRes.statusText}`)
    const hash = (await hashRes.text()).trim()

    // then fetch block details
    const blockRes = await fetch(`${b}/block/${hash}`, { signal: controller.signal })
    if (!blockRes.ok) throw new Error(`Failed to fetch block details: ${blockRes.status} ${blockRes.statusText}`)
    const data = await blockRes.json()

    const details: BlockDetails = {
      id: data.id,
      height: data.height,
      timestamp: data.timestamp,
      tx_count: data.tx_count ?? data.txCount ?? undefined
    }

    return details
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out')
    throw err
  } finally {
    clearTimeout(id)
  }
}

export type TwoBlocks = {
  current: BlockDetails
  previous: BlockDetails | null
}

// Fetch both latest block details and the previous block (height - 1) when available.
export async function fetchLatestAndPreviousBlockDetails(timeoutMs = 5000): Promise<TwoBlocks> {
  const base = (import.meta as any).env?.VITE_BLOCKSTREAM_API_BASE || 'https://blockstream.info/api'
  const b = base.replace(/\/$/, '')

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)

  try {
    // latest hash and details
    const hashRes = await fetch(`${b}/blocks/tip/hash`, { signal: controller.signal })
    if (!hashRes.ok) throw new Error(`Failed to fetch latest block hash: ${hashRes.status} ${hashRes.statusText}`)
    const latestHash = (await hashRes.text()).trim()

    const blockRes = await fetch(`${b}/block/${latestHash}`, { signal: controller.signal })
    if (!blockRes.ok) throw new Error(`Failed to fetch block details: ${blockRes.status} ${blockRes.statusText}`)
    const data = await blockRes.json()

    const current: BlockDetails = {
      id: data.id,
      height: data.height,
      timestamp: data.timestamp,
      tx_count: data.tx_count ?? data.txCount ?? undefined
    }

    // try to fetch previous block by height
    const prevHeight = current.height - 1
    if (prevHeight < 0) {
      return { current, previous: null }
    }

    // Blockstream offers /block-height/:height to get hash by height
    const prevHashRes = await fetch(`${b}/block-height/${prevHeight}`, { signal: controller.signal })
    if (!prevHashRes.ok) {
      // If prev not found, return null prev
      return { current, previous: null }
    }
    const prevHash = (await prevHashRes.text()).trim()
    const prevBlockRes = await fetch(`${b}/block/${prevHash}`, { signal: controller.signal })
    if (!prevBlockRes.ok) return { current, previous: null }
    const prevData = await prevBlockRes.json()

    const previous: BlockDetails = {
      id: prevData.id,
      height: prevData.height,
      timestamp: prevData.timestamp,
      tx_count: prevData.tx_count ?? prevData.txCount ?? undefined
    }

    return { current, previous }
  } catch (err: any) {
    if (err.name === 'AbortError') throw new Error('Request timed out')
    throw err
  } finally {
    clearTimeout(id)
  }
}
