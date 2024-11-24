import 'reflect-metadata'
import { DataSource } from 'typeorm'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'brighte_eats_eoi',
  synchronize: true,
  logging: true,
  entities: [
    'src/entity/**/*.ts'
  ],
  migrations: [],
  subscribers: [],
})
