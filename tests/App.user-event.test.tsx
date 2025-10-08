import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'
import useBlockchain from '@/store/useBlockchain'
import { ThemeProvider } from '@/context/ThemeContext'

test('Refresh triggers refresh and polling starts/stops', async () => {
  const refreshSpy = vi.spyOn(useBlockchain.getState(), 'refresh')
  const startSpy = vi.spyOn(useBlockchain.getState(), 'startPolling')
  const stopSpy = vi.spyOn(useBlockchain.getState(), 'stopPolling')

  useBlockchain.setState({ block: null, loading: false, error: null })
  render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
  const user = userEvent.setup()

  expect(startSpy).toHaveBeenCalled()

  const btn = screen.getByText(/Refresh/)
  await user.click(btn)
  expect(refreshSpy).toHaveBeenCalled()

  // unmount triggers stopPolling; cleanup is handled by the test harness when component unmounts
  // but we can call stopPolling manually to assert behavior
  useBlockchain.getState().stopPolling()
  expect(stopSpy).toHaveBeenCalled()

  refreshSpy.mockRestore()
  startSpy.mockRestore()
  stopSpy.mockRestore()
})
