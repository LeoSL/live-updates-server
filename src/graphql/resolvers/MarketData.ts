import { QueryMarketDataArgs, MarketDataResponse } from '../generated'
import { PubSub, withFilter } from 'apollo-server-express'

import { fetchMarketData } from '../data-source/market-data'

export const MarketDataResolvers = (pubsub: PubSub) => {
  return {
    Query: {
      async marketData(
        _: void,
        args: QueryMarketDataArgs,
      ): Promise<MarketDataResponse> {
        const data = fetchMarketData(args)

        return {
          marketDataResponse: data,
        }
      },
    },

    Subscription: {
      marketData: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(['DATA_GENERATED']),
          (payload, variables) => {
            const { baseTicker, quoteTicker } = variables

            // return filtered payload
            return (
              payload.marketData.marketDataResponse.displaySymbol ==
              `${baseTicker}-${quoteTicker}`
            )
          },
        ),
      },
    },
  }
}
