import { QueryMarketDataArgs, MarketDataResponse } from '../../generated'
import { generateRandomMarketDataResponse } from '../../mock-db'
import { filterArgsPerTickerPair } from '../../lib/util'

export const fetchMarketData = (
  args?: QueryMarketDataArgs,
): Promise<MarketDataResponse> =>
  new Promise((resolve, reject) => {
    if (args == null) {
      const response = generateRandomMarketDataResponse().marketDataResponse
        .tradingPairs as MarketDataResponse
      resolve(response)
    } else {
      console.log('📚 fetchMarketData Args', args)

      const { baseTicker, quoteTicker } = args

      const data = generateRandomMarketDataResponse().marketDataResponse
        .tradingPairs

      const response = filterArgsPerTickerPair(
        `${baseTicker}-${quoteTicker}`,
        data,
      )

      if (data == null || data.length === 0) {
        console.error('❌ Error: Ticket Pair not found', args)

        reject({
          marketDataResponse: undefined,
        })
      } else {
        resolve(response as MarketDataResponse)
      }
    }
  })

export const fetchMarketDataSubscription = (
  displaySymbol: string,
): Promise<MarketDataResponse> =>
  new Promise((resolve, reject) => {
    console.log('📚 fetchMarketDataSubscription Args', displaySymbol)

    const response = generateRandomMarketDataResponse(displaySymbol)
      .marketDataResponse.tradingPairs[0]

    if (response == null) {
      console.error(
        '❌ Subscription Error: Ticket Pair not found',
        displaySymbol,
      )

      reject({
        marketDataResponse: undefined,
      })
    } else {
      resolve({ marketDataResponse: response } as MarketDataResponse)
    }
  })
