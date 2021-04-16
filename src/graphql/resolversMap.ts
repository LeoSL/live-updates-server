import { IResolvers } from 'graphql-tools'
import { merge } from 'lodash'
import { MarketDataResolvers } from './resolvers/MarketData'
import { SubscriptionResolver } from './resolvers/Subscriptions'

const resolverMap: IResolvers = merge(MarketDataResolvers, SubscriptionResolver)
export default resolverMap
