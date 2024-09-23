const MissingParamError = require('../../utils/errors/missing-param-error')
const MongoHelper = require('../helpers/mongo-helper')

module.exports = class CreateUseRepository {
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
    const db = await MongoHelper.db
    const user = await db.collection('users').insertOne({ username, email, password: hashedPassword })
    return user
  }
}
