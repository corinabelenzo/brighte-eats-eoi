# brighte-eats-eoi

Brighte Eats Expression of Interest (EOI) API

## Project Overview

Brighte Eats is a new product being developed by Brighte to provide food delivery and pick-up services to customers. To gather customer interest in the various services that will be offered, Brighte needs a system to capture Expressions of Interest (EOI). The system allows customers to express their interest in services such as delivery, pick-up, and payment for the new product.

The project provides an API built with **Express.js**, backed by a **PostgreSQL** database, and exposes a GraphQL API powered by **PostGraphile**. The backend uses **TypeORM** for ORM-based database interaction, making it easier to manage and interact with the database.

This API serves two main functions:

1. **Capture Expressions of Interest**: Customers can submit EOIs indicating their interest in services.
2. **Dashboard View**: Brighte's team can view and manage the submitted EOIs in a user-friendly manner, gaining insights into customer preferences.

## Prerequisites

Before setting up the project, ensure you have the following software installed:

- **Node.js** version 20 or higher
- **PostgreSQL** version 15 or higher

## Setup
1. Clone the repository to your local machine.
```
git clone git@github.com:corinabelenzo/brighte-eats-eoi.git
cd brighte-eats-eoi
```

2. Install dependencies.
```
npm install
```

3. Setup the PostgreSQL Database. Make sure PostgreSQL is running. Create a database for the application.
```
psql -U postgres
CREATE DATABASE brighte_eats_eoi;
\q
```

4. Create a .env file in the root directory of the project. The .env file should include actual values for the following variables:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=brighte_eats_eoi
PORT=8090
```

## Running the Application
1. Once you have completed the setup, you can start the application by running:
```
npm start
```
The server will be running on http://localhost:8090.

2. Open a new terminal and run the command below to save products, Delivery, Pick-up, and Payment to the database:
```
curl --location --request POST 'localhost:8090/products'
```
You should see a “Products successfully saved!” message after executing this command.

3. You can start exploring the available queries and mutations via http://localhost:8090/graphiql.

## Testing
To run tests for the application, use the following command:
```
npm test
```
