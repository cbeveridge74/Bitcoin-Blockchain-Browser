import { render, screen } from '@testing-library/react'
import App from '@/App'
import useBlockchain from '@/store/useBlockchain'
import { ThemeProvider } from '@/context/ThemeContext'

test('renders app title and unknown height when not set', () => {
  // ensure store is in initial state
  useBlockchain.setState({ block: null, loading: false, error: null })
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
  expect(screen.getByText(/Bitcoin Blockchain Browser/i)).toBeInTheDocument()
  expect(screen.getByText(/Latest block height:/i)).toBeInTheDocument()
})

test('shows block details when present', () => {
  useBlockchain.setState({
    block: { id: 'aaa', height: 123, timestamp: 1600000000, tx_count: 10 },
    loading: false,
    error: null
  })
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
  expect(screen.getByText(/Block ID:/)).toBeInTheDocument()
  expect(screen.getByText(/Tx count:/)).toBeInTheDocument()
})

test('shows error UI when store has error', () => {
  const refreshSpy = vi.spyOn(useBlockchain.getState(), 'refresh').mockImplementation(async () => {})
  useBlockchain.setState({ block: null, loading: false, error: 'fail' })
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
  expect(screen.getByRole('alert')).toHaveTextContent(/Error/)
  refreshSpy.mockRestore()
})
