import express from 'express'
import { AppDataSource } from './data-source'
import { User } from './entity/User'
import { Product } from './entity/Product'

/**
* This is our main entry point of our Express server.
* All the routes in our API are going to be here.
**/
const App = () => {
  const app = express()
  app.use(express.json())
  
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
