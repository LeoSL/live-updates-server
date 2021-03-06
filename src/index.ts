import 'graphql-import-node'
import express from 'express'
import http from 'http'
import { GraphQLSchema } from 'graphql'
import {
  ApolloServer,
  makeExecutableSchema,
  PubSub,
} from 'apollo-server-express'

import * as marketDataTypeDefs from './graphql/types/marketData.graphql'
import { MarketDataResolvers } from './graphql/resolvers/MarketData'
import { fetchMarketDataSubscription } from './graphql/data-source/market-data'

const pubsub = new PubSub()

const generateMarketData = async () => {
  const availablePairs = ['BTC-CAD', 'BTC-USD', 'ETH-CAD']
  const randomPair =
    availablePairs[Math.floor(Math.random() * availablePairs.length)]

  const marketData = await fetchMarketDataSubscription(randomPair)

  pubsub.publish('DATA_GENERATED', {
    marketData,
  })

  setTimeout(generateMarketData, 1000)
}

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: marketDataTypeDefs,
  resolvers: MarketDataResolvers(pubsub),
})

const startApolloServer = async () => {
  const PORT = process.env.NODE_ENV === 'local' ? 4000 : process.env.PORT
  console.log('📈 SERVER PORT:', PORT)

  const httpURL = process.env.SERVER_HTTP_URL
  const wsURL = process.env.SERVER_WS_URL

  const app = express()
  const server = new ApolloServer({
    schema,
    subscriptions: {
      path: '/subscriptions',
      onConnect: () => {
        console.log('⚡️ Client connected')
      },
      onDisconnect: () => {
        console.log('⚡️ Client disconnected')
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
