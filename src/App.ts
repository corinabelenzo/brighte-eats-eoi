import express from 'express'
import postgraphile from 'postgraphile'
import { makeExtendSchemaPlugin, gql } from 'graphile-utils'
import { AppDataSource } from './data-source'
import { User } from './entity/User'
import { Product } from './entity/Product'
import { registerUser } from './service/registration'

const pgUsername = 'postgres'
const pgPassword = 'postgres'

const RegisterUserPlugin = makeExtendSchemaPlugin(_build => {
  return {
    typeDefs: gql`
      input RegisterUserInput {
        name: String!
        email: String!
        mobile: String!
        postcode: String!
        interests: [String]
      }

      type RegisterUserPayload {
        name: String,
        email: String,
        mobile: String,
        postcode: String,
        interests: [String]
      }

      extend type Mutation {
        registerUser(input: RegisterUserInput!): RegisterUserPayload
      }
    `,
    resolvers: {
      Mutation: {
        registerUser: async (_query, args, _context, _resolveInfo) => {
          try {
            const { name, email, mobile, postcode, interests } = args.input
            const userRegistration = await registerUser(name, email, mobile, postcode, interests)
            return { ...userRegistration }
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
  app.use(postgraphile(`postgresql://${pgUsername}:${pgPassword}@localhost/brighte_eats_eoi`, 'public', {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    appendPlugins: [RegisterUserPlugin],
  }))
  
  app.get('/api/v1/hello', async (req, res, next) => {
    res.send('Success!\n')
  })

  app.post('/api/v1/test/data', async (req, res, next) => {
    const delivery = new Product()
    delivery.name = 'Delivery'
    const pickUp = new Product()
    pickUp.name = 'Pick-up'
    const payment = new Product()
    payment.name = 'Payment'
    await AppDataSource.manager.save([delivery, pickUp, payment])

    const user = new User()
    user.name = 'Kon'
    user.email = 'kon@email.com'
    user.mobile = '09123456789'
    user.postcode = '1234'
    user.interests = [ delivery, payment ]
    await AppDataSource.manager.save(user)

    res.send('Data seeding completed!\n')
  })

  return app
}

export default App
