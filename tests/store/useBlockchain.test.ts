import useBlockchain from '@/store/useBlockchain'
import * as api from '@/api/blockchain'

test('refresh fetches and stores block details', async () => {
  const fake: api.BlockDetails = { id: '000abc', height: 900000, timestamp: 1670000000, tx_count: 2000 }
  const spy = vi.spyOn(api, 'fetchLatestAndPreviousBlockDetails').mockResolvedValue({ current: fake, previous: null })
  // reset
  useBlockchain.setState({ block: null, error: null, previousBlock: null })

  // mock localStorage
  const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

  await useBlockchain.getState().refresh()
  expect(useBlockchain.getState().block).toEqual(fake)
  expect(useBlockchain.getState().previousBlock).toBeNull()
  expect(setItemSpy).toHaveBeenCalled()
  setItemSpy.mockRestore()
  spy.mockRestore()
})

test('refresh sets error when API fails', async () => {
  const spy = vi.spyOn(api, 'fetchLatestAndPreviousBlockDetails').mockRejectedValue(new Error('network'))
  useBlockchain.setState({ block: null, error: null, previousBlock: null })
  await useBlockchain.getState().refresh()
  expect(useBlockchain.getState().error).toBeTruthy()
  spy.mockRestore()
})

test('previousBlock is set on consecutive refreshes', async () => {
  const first: api.BlockDetails = { id: 'first', height: 1, timestamp: 1, tx_count: 1 }
  const second: api.BlockDetails = { id: 'second', height: 2, timestamp: 2, tx_count: 2 }
  const spy = vi.spyOn(api, 'fetchLatestAndPreviousBlockDetails')
    .mockResolvedValueOnce({ current: first, previous: null })
    .mockResolvedValueOnce({ current: second, previous: first })

  useBlockchain.setState({ block: null, previousBlock: null, error: null })
  await useBlockchain.getState().refresh()
  expect(useBlockchain.getState().block).toEqual(first)
  await useBlockchain.getState().refresh()
  expect(useBlockchain.getState().previousBlock).toEqual(first)
  expect(useBlockchain.getState().block).toEqual(second)
  spy.mockRestore()
})
