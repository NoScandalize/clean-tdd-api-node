const MongoHelper = require('../../infra/helpers/mongo-helper')
const request = require('supertest')
const app = require('../config/app')
let userModel

describe('register routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    userModel = await MongoHelper.getCollection('users')
  })

  beforeEach(async () => {
    await userModel.deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should return 200 when valid credentials are provided', async () => {
    await request(app)
      .post('/api/register')
      .send({
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      })
      .expect(200)
  })

  test('should return 400 when invalid credentials are provided', async () => {
    await request(app)
      .post('/api/register')
      .send({})
      .expect(400)
  })
})
