import express from 'express'
import postgraphile from 'postgraphile'
import * as dotenv from 'dotenv'
import { makeExtendSchemaPlugin, gql } from 'graphile-utils'
import { AppDataSource } from './data-source'
import { User } from './entity/User'
import { Product } from './entity/Product'
import { register } from './service/registration'

dotenv.config()

const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;

const RegisterPlugin = makeExtendSchemaPlugin(_build => {
  return {
    typeDefs: gql`
      input RegisterInput {
        name: String!
        email: String!
        mobile: String!
        postcode: String!
        interests: [String]
      }

      type RegisterPayload {
        name: String,
        email: String,
        mobile: String,
        postcode: String,
        interests: [String]
      }

      extend type Mutation {
        register(input: RegisterInput!): RegisterPayload
      }
    `,
    resolvers: {
      Mutation: {
        register: async (_query, args, _context, _resolveInfo) => {
          try {
            const { name, email, mobile, postcode, interests } = args.input
            const registration = await register(name, email, mobile, postcode, interests)
            return { ...registration }
          } catch (e) {
            console.error('Error registering user', e)
            throw e
          }
        }
      }
    },
  };
});

const App = () => {
  const app = express()
  app.use(express.json())
  app.use(postgraphile(`postgresql://${dbUsername}:${dbPassword}@${dbHost}/${dbName}`, 'public', {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    appendPlugins: [RegisterPlugin],
  }))

  app.post('/products', async (req, res, next) => {
    const delivery = new Product()
    delivery.name = 'Delivery'
    const pickUp = new Product()
    pickUp.name = 'Pick-up'
    const payment = new Product()
    payment.name = 'Payment'
    await AppDataSource.manager.save([delivery, pickUp, payment])

    res.send('Products successfully saved!\n')
  })

  return app
}

export default App
