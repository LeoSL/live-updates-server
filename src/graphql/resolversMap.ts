import { IResolvers } from 'graphql-tools'
import { merge } from 'lodash'
import { MarketDataResolvers } from './resolvers/MarketData'

const resolverMap: IResolvers = merge(MarketDataResolvers)
export default resolverMap
