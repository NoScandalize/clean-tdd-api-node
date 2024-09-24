const RegisterRouter = require('../../presentation/routers/register-router')
const AuthUseCase = require('../../domain/usecases/auth-usecase')
const EmailValidator = require('../../utils/helpers/email-validator')
const LoadUserByEmailRepository = require('../../infra/repositories/load-user-by-email-repository')
const CreateUserRepository = require('../../infra/repositories/create-user-repository')
const Encrypter = require('../../utils/helpers/encrypter')
const UpdateAccessTokenRepository = require('../../infra/repositories/update-access-token-repository')
const TokenGenerator = require('../../utils/helpers/token-generator')
const env = require('../config/env')

module.exports = class RegisterRouterComposer {
  static compose () {
    const emailValidator = new EmailValidator()
    const encrypter = new Encrypter()
    const tokenGenerator = new TokenGenerator(env.tokenSecret)
    const loadUserByEmailRepository = new LoadUserByEmailRepository()
    const createUserRepository = new CreateUserRepository()
    const updateAccessTokenRepository = new UpdateAccessTokenRepository()
    const authUseCase = new AuthUseCase({
      loadUserByEmailRepository,
      updateAccessTokenRepository,
      encrypter,
      tokenGenerator
    })
    return new RegisterRouter({
      authUseCase,
      emailValidator,
      loadUserByEmailRepository,
      createUserRepository,
      encrypter
    })
  }
}
