const MissingParamError = require('../../utils/errors/missing-param-error')

module.exports = class CreateUseRepository {
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
