import express from 'express'
import http from 'http'
import { ApolloServer, gql, IResolvers } from 'apollo-server-express'
import { PubSub } from 'apollo-server-express'

import { QueryMarketDataArgs, MarketDataResponse } from './graphql/generated'
import { filterArgsPerTickerPair } from './graphql/resolvers/MarketData'
import {
  generateRandomMarketDataResponse,
  mockDataResponse,
} from './graphql/mockDB'

const pubsub = new PubSub()

const generateMarketData = () => {
  const marketData = generateRandomMarketDataResponse()
  console.log('inside Generation..........', JSON.stringify(marketData))

  pubsub.publish('DATA_GENERATED', {
    marketData,
  })

  setTimeout(generateMarketData, 1000)
}

// TypeDefs --------------------

const typeDefs = gql`
  scalar JSON

  type Query {
    marketData(baseTicker: String!, quoteTicker: String!): MarketDataResponse!
  }

  type Mutation {
    generateMarketData: MarketDataResponse!
  }

  type Subscription {
    marketData: MarketDataResponse
  }

  type MarketDataResponse {
    marketDataResponse: JSON
  }
`

// Resolvers ----------------

const MarketDataResolvers: IResolvers = {
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

  Subscription: {
    marketData: {
      subscribe: () => pubsub.asyncIterator(['DATA_GENERATED']),
    },
  },
}

async function startApolloServer() {
  const PORT = 4000

  const app = express()
  const server = new ApolloServer({
    typeDefs,
    resolvers: MarketDataResolvers,
    subscriptions: {
      path: '/subscriptions',
      onConnect: (connectionParams, webSocket, context) => {
        console.log('Client connected')
      },
      onDisconnect: (webSocket, context) => {
        console.log('Client disconnected')
      },
    },
  })

  await server.start()
  server.applyMiddleware({ app })

  const httpServer = http.createServer(app)
  server.installSubscriptionHandlers(httpServer)

  // @ts-ignore
  await new Promise((resolve) => httpServer.listen(PORT, resolve))

  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`,
  )
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`,
  )

  generateMarketData()

  return { server, app, httpServer }
}

startApolloServer()
