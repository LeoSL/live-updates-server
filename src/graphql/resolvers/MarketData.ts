import { IResolvers } from 'graphql-tools'
import { QueryMarketDataArgs, MarketDataResponse } from '../generated'

import { mockDataResponse } from '../mockDB'

export const MarketDataResolvers: IResolvers = {
  Query: {
    async marketData(
      _: void,
      args: QueryMarketDataArgs,
    ): Promise<MarketDataResponse> {
      console.log('📚 Args', args)

      return {
        data: mockDataResponse,
      }
    },
  },
}
