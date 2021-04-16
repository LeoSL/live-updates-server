import express from 'express'
import http from 'http'
import { ApolloServer } from 'apollo-server-express'
import { PubSub } from 'apollo-server-express'

import schema from './graphql/schemasMap'
import { mockDataResponse } from './graphql/mockDB'

const generateMarketData = () => {
  const pubsub = new PubSub()

  pubsub.publish('DATA_GENERATED', {
    marketData: mockDataResponse.tradingPairs,
  })

  setTimeout(generateMarketData, 1000)
}

async function startApolloServer() {
  const PORT = 4000

  const app = express()
  const server = new ApolloServer({
    schema,
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
  // server.applyMiddleware({ app, path: '/graphql' })
  server.applyMiddleware({ app })

  const httpServer = http.createServer(app)
  server.installSubscriptionHandlers(httpServer)

  // Make sure to call listen on httpServer, NOT on app.
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
