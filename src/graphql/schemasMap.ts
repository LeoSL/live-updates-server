import 'graphql-import-node'
import { makeExecutableSchema } from 'graphql-tools'
import { GraphQLSchema } from 'graphql'

import * as marketDataTypeDefs from './schemas/marketData.graphql'
import * as emptyTypeDefs from './schemas/empty.graphql'
import resolvers from './resolversMap'

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs: [emptyTypeDefs, marketDataTypeDefs],
  resolvers,
})

export default schema
