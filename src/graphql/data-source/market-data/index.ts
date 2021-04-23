import { QueryMarketDataArgs, MarketDataResponse } from '../../generated'
import { generateRandomMarketDataResponse } from '../../mock-db'
import { filterArgsPerTickerPair } from '../../lib/util'

export const fetchMarketData = (
  args: QueryMarketDataArgs,
): Promise<MarketDataResponse> =>
  new Promise((resolve, reject) => {
    console.log('📚 getMarketData Args', args)

    const { baseTicker, quoteTicker } = args

    const data = generateRandomMarketDataResponse().marketDataResponse
      .tradingPairs

    const response = filterArgsPerTickerPair(
      `${baseTicker}-${quoteTicker}`,
      data,
    )

    if (data == null || data.length === 0) {
      console.error('❌ Error: Ticker Pair not found', args)

      reject({
        marketDataResponse: undefined,
      })
    } else {
      resolve(response as MarketDataResponse)
    }
  })
