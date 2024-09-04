const HttpResponse = require('../helpers/http-response')

module.exports = class RegisterRouter {
  async exec (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return HttpResponse.internalServerError()
    }
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
  }
}
