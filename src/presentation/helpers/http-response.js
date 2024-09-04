const MissingParamError = require('./missing-param-error')
const PasswordMismatchError = require('./password-mismatch-error')

module.exports = class HttpResponse {
  static badRequest (paramName) {
    if (paramName.split(' ').length > 1) {
      return {
        statusCode: 400,
        body: new PasswordMismatchError(paramName)
      }
    }
    return {
      statusCode: 400,
      body: new MissingParamError(paramName)
    }
  }

  static internalServerError () {
    return {
      statusCode: 500
    }
  }
}
