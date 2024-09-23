const MissingParamError = require('../../utils/errors/missing-param-error')

class CreateUseRepository {
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
  }
}

describe('createUser repository', () => {
  test('should throw if no params are provided', async () => {
    const sut = new CreateUseRepository()
    expect(sut.create()).rejects.toThrow(new MissingParamError('username'))
    expect(sut.create('any_username')).rejects.toThrow(new MissingParamError('email'))
    expect(sut.create('any_username', 'valid_email')).rejects.toThrow(new MissingParamError('hashedPassword'))
  })
})
