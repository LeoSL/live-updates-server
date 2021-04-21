import { mockDataResponse } from '../mockdb'
import { filterArgsPerTickerPair } from './MarketData'

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
