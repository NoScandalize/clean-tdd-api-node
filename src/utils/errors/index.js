const MissingParamError = require('../../utils/errors/missing-param-error')
const InvalidParamError = require('../../utils/errors/invalid-param-error')
const PasswordMismatchError = require('../../utils/errors/password-mismatch-error')
const AlreadyExistsError = require('../../utils/errors/already-exists-error')

module.exports = {
  MissingParamError,
  InvalidParamError,
  PasswordMismatchError,
  AlreadyExistsError
}
