const HttpResponse = require('../helpers/http-response')
const MissingParamError = require('../helpers/missing-param-error')
const PasswordMismatchError = require('../helpers/password-mismatch-error')
const InvalidParamError = require('../helpers/invalid-param-error')

module.exports = class RegisterRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async exec (httpRequest) {
    try {
      const { username, email, password, confirmPassword } = httpRequest.body
      if (!username) {
        return HttpResponse.badRequest(new MissingParamError('username'))
      }
      if (!email) {
        return HttpResponse.badRequest(new MissingParamError('email'))
      }
      if (!this.emailValidator.isValid(email)) {
        return HttpResponse.badRequest(new InvalidParamError('email'))
      }
      if (!password) {
        return HttpResponse.badRequest(new MissingParamError('password'))
      }
      if (!confirmPassword) {
        return HttpResponse.badRequest(new MissingParamError('confirmPassword'))
      }
      if (password !== confirmPassword) {
        return HttpResponse.badRequest(new PasswordMismatchError('Password does not match password confirmation.'))
      }
      const accessToken = await this.authUseCase.auth(username, email, password, confirmPassword)
      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }
      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.internalServerError()
    }
  }
}
