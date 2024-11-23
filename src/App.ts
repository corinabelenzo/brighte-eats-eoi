import express from "express"

/**
* This is our main entry point of our Express server.
* All the routes in our API are going to be here.
**/
const App = () => {
  const app = express()
  app.use(express.json())
  
  app.get("/api/v1/hello", async (req, res, next) => {
    res.send("success")
  }) 
  
  return app
}

export default App
