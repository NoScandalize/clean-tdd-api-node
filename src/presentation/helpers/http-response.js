const MissingParamError = require('./missing-param-error')

module.exports = class HttpResponse {
  static badRequest (paramName) {
    if (!paramName) {
      return {
        statusCode: 400
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
