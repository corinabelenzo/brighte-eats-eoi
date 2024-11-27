import * as dotenv from 'dotenv'
import { AppDataSource } from "./data-source"
import App from "./App"

dotenv.config()

// This is going to be our default local port for our backend. Feel free to change it.
const PORT = process.env.PORT;

// Initializes the Datasource for TypeORM
AppDataSource.initialize().then(async () => {
  // Express setup
  const app = App()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch((err) => {
  console.error(err.stack)
})
