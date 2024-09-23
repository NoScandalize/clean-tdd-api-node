const HttpResponse = require('../helpers/http-response')
const { MissingParamError, PasswordMismatchError, InvalidParamError, AlreadyExistsError } = require('../../utils/errors')

module.exports = class RegisterRouter {
  constructor ({ authUseCase, emailValidator, loadUserByEmailRepository, createUserRepository, encrypter } = {}) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.createUserRepository = createUserRepository
    this.encrypter = encrypter
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
        return HttpResponse.badRequest(new AlreadyExistsError('email'))
      }
      const hashedPassword = await this.encrypter.encrypt(password)
      if (!hashedPassword) {
        return HttpResponse.internalServerError()
      }
      await this.createUserRepository.create(username, email, hashedPassword)
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
