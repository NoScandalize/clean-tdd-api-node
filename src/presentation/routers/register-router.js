const HttpResponse = require('../helpers/http-response')

module.exports = class RegisterRouter {
  constructor (authUseCase) {
    this.authUseCase = authUseCase
  }

  async exec (httpRequest) {
    try {
      const { username, email, password, confirmPassword } = httpRequest.body
      if (!username) {
        return HttpResponse.badRequest('username')
      }
      if (!email) {
        return HttpResponse.badRequest('email')
      }
      if (!password) {
        return HttpResponse.badRequest('password')
      }
      if (!confirmPassword) {
        return HttpResponse.badRequest('confirmPassword')
      }
      if (password !== confirmPassword) {
        return HttpResponse.badRequest('Password does not match password confirmation.')
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
