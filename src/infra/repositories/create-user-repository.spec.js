const MissingParamError = require('../../utils/errors/missing-param-error')
const MongoHelper = require('../../infra/helpers/mongo-helper')
const CreateUseRepository = require('./create-user-repository')

let userModel

const makeSut = () => {
  return new CreateUseRepository()
}

describe('createUser repository', () => {
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

  test('should throw if no params are provided', async () => {
    const sut = makeSut()
    expect(sut.create()).rejects.toThrow(new MissingParamError('username'))
    expect(sut.create('any_username')).rejects.toThrow(new MissingParamError('email'))
    expect(sut.create('any_username', 'valid_email')).rejects.toThrow(new MissingParamError('hashedPassword'))
  })

  test('should return a user if the user is created', async () => {
    const sut = makeSut()
    const user = await sut.create('any_username', 'valid_email@mail.com', 'any_hashedPassord')
    expect(user.insertedId).toBeTruthy()
  })
})
