import express from 'express'
import http from 'http'
import { ApolloServer, gql, IResolvers } from 'apollo-server-express'
import { PubSub } from 'apollo-server-express'

import { QueryMarketDataArgs, MarketDataResponse } from './graphql/generated'
import { filterArgsPerTickerPair } from './graphql/resolvers/MarketData'
import { generateRandomMarketDataResponse } from './graphql/mockdb'

const pubsub = new PubSub()

const generateMarketData = () => {
  const marketData = generateRandomMarketDataResponse()

  // console.log('Market data generated: ', JSON.stringify(marketData))

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
      const mockDataResponse = generateRandomMarketDataResponse()
        .marketDataResponse.tradingPairs
      const data = filterArgsPerTickerPair(
        `${baseTicker}-${quoteTicker}`,
        mockDataResponse,
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
  const environment = process.env.NODE_ENV
  const PORT = environment === 'local' ? 4000 : process.env.PORT
  const httpURL = process.env.SERVER_HTTP_LOCAL_URL
  const wsURL = process.env.SERVER_WS_LOCAL_URL

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

  console.log(`🚀 Server ready at ${httpURL}:${PORT}${server.graphqlPath}`)
  console.log(
    `🚀 Subscriptions ready at ${wsURL}:${PORT}${server.subscriptionsPath}`,
  )

  generateMarketData()

  return { server, app, httpServer }
}

startApolloServer()
