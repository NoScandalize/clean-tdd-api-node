const RegisterRouter = require('./register-router')
const { MissingParamError, InvalidParamError, AlreadyExistsError } = require('../../utils/errors')
const { UnauthorizedError, ServerError } = require('../errors')

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const createUserRepositorySpy = makeCreateUserRepository()
  const encrypterSpy = makeEncrypter()
  const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy, createUserRepositorySpy, encrypterSpy)
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy,
    loadUserByEmailRepositorySpy,
    createUserRepositorySpy,
    encrypterSpy
  }
}

const makeEncrypter = () => {
  class EncrypterSpy {
    async encrypt (password) {
      this.password = password
      return this.hashedPassword
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.hashedPassword = 'any_hashedPassword'
  return encrypterSpy
}

const makeCreateUserRepository = () => {
  class CreateUserRepositorySpy {
    async create (username, email, password) {
      this.username = username
      this.email = email
      this.password = password
    }
  }
  return new CreateUserRepositorySpy()
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  return loadUserByEmailRepositorySpy
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_token'
  return authUseCaseSpy
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error()
    }
  }
  return new AuthUseCaseSpy()
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid () {
      throw new Error()
    }
  }
  return new EmailValidatorSpy()
}

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    load () {
      throw new Error()
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makeCreateUserRepositoryWithError = () => {
  class CreateUserRepositorySpy {
    create () {
      throw new Error()
    }
  }
  return new CreateUserRepositorySpy()
}

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    encrypt () {
      throw new Error()
    }
  }
  return new EncrypterSpy()
}

describe('register router', () => {
  test('should return 400 if username is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('username'))
  })

  test('should return 400 if email is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  test('should return 400 if password is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 400 if confirmPassword is not provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('confirmPassword'))
  })

  test('should return 400 if LoadUserByEmailRepository returns an already user', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = {}
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'registered_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new AlreadyExistsError('email'))
  })

  test('should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.exec()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.exec({})
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 400 if password is not equal to confirmPassword', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'another_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
  })

  test('should call AuthUseCase with correct params', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    await sut.exec(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        username: 'invalid_username',
        email: 'invalid_email@mail.com',
        password: 'invalid_password',
        confirmPassword: 'invalid_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  test('should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        username: 'valid_username',
        email: 'valid_email@mail.com',
        password: 'valid_password',
        confirmPassword: 'valid_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })

  test('should return 500 if no authUseCase is provided', async () => {
    const sut = new RegisterRouter()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if authUseCase has no auth method', async () => {
    const sut = new RegisterRouter({})
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if authUseCase throws', async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError()
    const sut = new RegisterRouter(authUseCaseSpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'invalid_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('should return 500 if no EmailValidator is provided', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const sut = new RegisterRouter(authUseCaseSpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if no EmailValidator has no isValid method', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const sut = new RegisterRouter(authUseCaseSpy, {})
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if EmailValidator throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidatorWithError()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    await sut.exec(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })

  test('should return 500 if no LoadUserEmailByRepository is provided', async () => {
    const authUserCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidator()
    const sut = new RegisterRouter(authUserCaseSpy, emailValidatorSpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if no LoadUserByEmailRepository has no load method', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidator()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, {})
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if LoadUserByEmailRepository throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeAuthUseCase()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepositoryWithError()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    await sut.exec(httpRequest)
    expect(loadUserByEmailRepositorySpy.email).toBe(httpRequest.body.email)
  })

  test('should return 500 if no CreateUserRepository is provided', async () => {
    const authUserCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidator()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
    const sut = new RegisterRouter(authUserCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if no CreateUserRepository has no create method', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidator()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy, {})
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if CreateUserRepository throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeAuthUseCase()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepositoryWithError()
    const createUserRepositorySpy = makeCreateUserRepositoryWithError()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy, createUserRepositorySpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should call CreateUserRepository with correct params', async () => {
    const { sut, createUserRepositorySpy } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    await sut.exec(httpRequest)
    expect(createUserRepositorySpy.username).toBe(httpRequest.body.username)
    expect(createUserRepositorySpy.email).toBe(httpRequest.body.email)
    expect(createUserRepositorySpy.password).toBe(httpRequest.body.password)
  })

  test('should return 500 if no Encrypter is provided', async () => {
    const authUserCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidator()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
    const createUserRepositorySpy = makeCreateUserRepository()
    const sut = new RegisterRouter(authUserCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy, createUserRepositorySpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if no Encrypter has no encrypt method', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidator()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
    const createUserRepositorySpy = makeCreateUserRepository()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy, createUserRepositorySpy, {})
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if Encrypter throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeAuthUseCase()
    const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepositoryWithError()
    const createUserRepositorySpy = makeCreateUserRepository()
    const encrypterSpy = makeEncrypterWithError()
    const sut = new RegisterRouter(authUseCaseSpy, emailValidatorSpy, loadUserByEmailRepositorySpy, createUserRepositorySpy, encrypterSpy)
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should call Encrypter with correct password', async () => {
    const { sut, encrypterSpy } = makeSut()
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    await sut.exec(httpRequest)
    expect(encrypterSpy.password).toBe(httpRequest.body.password)
  })

  test('should return 500 if Encrypter return null', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.hashedPassword = null
    const httpRequest = {
      body: {
        username: 'any_username',
        email: 'any_email@mail.com',
        password: 'any_password',
        confirmPassword: 'any_password'
      }
    }
    const httpResponse = await sut.exec(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
