import { expect, it, beforeAll, beforeEach, afterAll, describe } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')

    // --> this delete the data from the database and run the tests, the idea in this code is to execute tests without db data, every time, but there's
    // a problem here, this isnt so good because executing this commands isnt so performable, so can increase time in your tests.
    // in a summary isnt a good practice.
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit'
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', String(cookies))
      .expect(200)

    expect(listTransactionsResponse.body.transaction).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    ])
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transaction',
        amount: 5000,
        type: 'credit'
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', String(cookies))
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransacionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', String(cookies))
      .expect(200)

    expect(getTransacionResponse.body.transactions).toEqual(
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000
      })
    )
  })
})

it('should be able to get the summary', async () => {
  const createTransactionResponse = await request(app.server)
    .post('/transactions')
    .send({
      title: 'New Transaction',
      amount: 5000,
      type: 'credit'
    })

  const cookies = createTransactionResponse.get('Set-Cookie')

  await request(app.server)
    .post('/transactions')
    .set('Cookie', String(cookies))
    .send({
      title: 'Debit transaction',
      amount: 2000,
      type: 'debit'
    })

  const summaryResponse = await request(app.server)
    .get('/transactions/summary')
    .set('Cookie', String(cookies))
    .expect(200)

  expect(summaryResponse.body.transaction).toEqual([
    expect.objectContaining({
      title: 'New transaction',
      amount: 5000
    })
  ])

  expect (summaryResponse.body.summary).toEqual({
    amount: 3000,
  })
})
