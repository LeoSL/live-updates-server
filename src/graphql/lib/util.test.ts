import { mockDataResponse } from '../mock-db'
import { filterArgsPerTickerPair } from './util'

describe('#filterArgsPerTickerPair', () => {
  it('returns only the requested trading pairs', () => {
    const pair = 'BTC-CAD'
    const displaySymbol = filterArgsPerTickerPair(
      pair,
      mockDataResponse.tradingPairs,
    ).find((entry) => entry.displaySymbol === pair)?.displaySymbol

    expect(displaySymbol).toBe(pair)
  })
})
