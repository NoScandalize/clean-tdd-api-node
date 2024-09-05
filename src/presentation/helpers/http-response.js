const MissingParamError = require('./missing-param-error')
const PasswordMismatchError = require('./password-mismatch-error')
const UnauthorizedError = require('./unauthorized-error')

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

  static unauthorizedError () {
    return {
      statusCode: 401,
      body: new UnauthorizedError()
    }
  }

  static ok (data) {
    return {
      statusCode: 200,
      body: data
    }
  }
}
