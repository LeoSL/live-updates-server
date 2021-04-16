import { PubSub } from 'apollo-server-express'

const pubsub = new PubSub()

export const SubscriptionResolver = {
  Subscription: {
    marketData: {
      subscribe: () => pubsub.asyncIterator(['DATA_GENERATED']),
    },
  },
}
