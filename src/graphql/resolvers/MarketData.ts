import { IResolvers } from 'graphql-tools'
import { QueryMarketDataArgs, MarketDataResponse } from '../generated'
import { PubSub } from 'apollo-server-express'

import { mockDataResponse } from '../mock-db'

const pubsub = new PubSub()

type TradingPair = {
  displaySymbol: string
  baseCurrency: string
  quoteCurrency: string
  marketDataLast24HourPriceAggregate: any
}

export const filterArgsPerTickerPair = (
  tickerPair: string,
  tradingPairs: TradingPair[],
): TradingPair[] => {
  return tradingPairs.filter((pair) => pair.displaySymbol === tickerPair)
}

export const MarketDataResolvers: IResolvers = {
  Query: {
    async marketData(
      _: void,
      args: QueryMarketDataArgs,
    ): Promise<MarketDataResponse> {
      const { baseTicker, quoteTicker } = args
      const data = filterArgsPerTickerPair(
        `${baseTicker}-${quoteTicker}`,
        mockDataResponse.tradingPairs,
      )

      if (data == null || data.length === 0) {
        console.error('❌ Error: Ticker Pair not found', args)
        return {
          marketDataResponse: undefined,
        }
      }

      console.log('📚 Args', args)

      return {
        marketDataResponse: data,
      }
    },
  },
  Mutation: {
    async generateMarketData(_: void, args: any): Promise<MarketDataResponse> {
      pubsub.publish('DATA_GENERATED', {
        marketData: mockDataResponse.tradingPairs,
      })

      return {
        marketDataResponse: mockDataResponse.tradingPairs,
      }
    },
  },
}
