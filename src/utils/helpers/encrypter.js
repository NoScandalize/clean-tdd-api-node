const bcrypt = require('bcrypt')
const MissingParamError = require('../errors/missing-param-error')

module.exports = class Encrypter {
  async compare (value, hash) {
    if (!value) {
      throw new MissingParamError('value')
    }
    if (!hash) {
      throw new MissingParamError('hash')
    }
    const isValid = await bcrypt.compare(value, hash)
    return isValid
  }

  async encrypt (value, saltRounded) {
    if (!value) {
      throw new MissingParamError('value')
    }
    if (!saltRounded) {
      throw new MissingParamError('salt')
    }
    const salt = await bcrypt.genSalt(saltRounded)
    const hash = await bcrypt.hash(value, salt)
    return hash
  }
}
