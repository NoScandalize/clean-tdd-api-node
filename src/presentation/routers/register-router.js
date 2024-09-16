const HttpResponse = require('../helpers/http-response')
const { MissingParamError, PasswordMismatchError, InvalidParamError } = require('../../utils/errors')

module.exports = class RegisterRouter {
  constructor (authUseCase, emailValidator, loadUserByEmailRepository) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
    this.loadUserByEmailRepository = loadUserByEmailRepository
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
      if (await this.loadUserByEmailRepository.load(email)) {
        return HttpResponse.badRequest(new InvalidParamError('email'))
      }
      const accessToken = await this.authUseCase.auth(email, password)
      if (!accessToken) {
        return HttpResponse.unauthorizedError()
      }
      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.internalServerError()
    }
  }
}
