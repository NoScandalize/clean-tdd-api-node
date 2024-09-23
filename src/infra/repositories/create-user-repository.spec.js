const MissingParamError = require('../../utils/errors/missing-param-error')
const MongoHelper = require('../../infra/helpers/mongo-helper')

let db

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new CreateUseRepository(userModel)
  return { sut, userModel }
}
class CreateUseRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async create (username, email, hashedPassword) {
    if (!username) {
      throw new MissingParamError('username')
    }
    if (!email) {
      throw new MissingParamError('email')
    }
    if (!hashedPassword) {
      throw new MissingParamError('hashedPassword')
    }
    const user = await this.userModel.insertOne({ username, email, password: hashedPassword })
    return user
  }
}

describe('createUser repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    db = await MongoHelper.db
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should throw if no userModel is provided', async () => {
    const sut = new CreateUseRepository()
    const promise = sut.create('any_username', 'valid_email@mail.com', 'any_hashedPassord')
    expect(promise).rejects.toThrow()
  })

  test('should throw if no params are provided', async () => {
    const { sut } = makeSut()
    expect(sut.create()).rejects.toThrow(new MissingParamError('username'))
    expect(sut.create('any_username')).rejects.toThrow(new MissingParamError('email'))
    expect(sut.create('any_username', 'valid_email')).rejects.toThrow(new MissingParamError('hashedPassword'))
  })
})
