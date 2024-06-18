import { knex as setupKnex, Knex } from 'knex'
import { env } from '../src/env/index'

export const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/migrations',
  }
}

export const knex = setupKnex(config)
