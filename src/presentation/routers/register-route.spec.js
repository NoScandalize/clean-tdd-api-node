const RegisterRouter = require('./register-router')
const { MissingParamError, InvalidParamError, AlreadyExistsError } = require('../../utils/errors')
const { UnauthorizedError, ServerError } = require('../errors')

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const createUserRepositorySpy = makeCreateUserRepository()
  const encrypterSpy = makeEncrypter()
  const sut = new RegisterRouter({
    authUseCase: authUseCaseSpy,
    emailValidator: emailValidatorSpy,
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    createUserRepository: createUserRepositorySpy,
    encrypter: encrypterSpy
  })
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
    async create (username, email, hashedPassword) {
      this.username = username
      this.email = email
      this.hashedPassword = hashedPassword
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
    expect(httpResponse.body.error).toBe(new MissingParamError('username').message)
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
    expect(httpResponse.body.error).toBe(new MissingParamError('email').message)
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
    expect(httpResponse.body.error).toBe(new MissingParamError('password').message)
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
    expect(httpResponse.body.error).toBe(new MissingParamError('confirmPassword').message)
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
    expect(httpResponse.body.error).toBe(new AlreadyExistsError('email').message)
  })

  test('should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.exec()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error).toBe(new ServerError().message)
  })

  test('should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.exec({})
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error).toBe(new ServerError().message)
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
    expect(httpResponse.body.error).toBe(new UnauthorizedError().message)
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
    expect(httpResponse.body.error).toBe(new InvalidParamError('email').message)
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

  test('should call CreateUserRepository with correct params', async () => {
    const { sut, createUserRepositorySpy, encrypterSpy } = makeSut()
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
    expect(createUserRepositorySpy.hashedPassword).toBe(encrypterSpy.hashedPassword)
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

  test('should throw if invalid dependencies is provided', async () => {
    const invalid = {}
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidator()
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const createUserRepository = makeCreateUserRepository()
    const suts = [].concat(
      new RegisterRouter(),
      new RegisterRouter({}),
      new RegisterRouter({
        authUseCase: invalid
      }),
      new RegisterRouter({
        authUseCase
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator: invalid
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository: invalid
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository,
        createUserRepository: invalid
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository,
        createUserRepository
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository,
        createUserRepository,
        encrypter: invalid
      })
    )
    for (const sut of suts) {
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
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })

  test('should throw if any dependency throw', async () => {
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidator()
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const createUserRepository = makeCreateUserRepository()
    const suts = [].concat(
      new RegisterRouter({
        authUseCase: makeAuthUseCaseWithError()
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator: makeEmailValidatorWithError()
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository,
        createUserRepository: makeCreateUserRepositoryWithError()
      })
      ,
      new RegisterRouter({
        authUseCase,
        emailValidator,
        loadUserByEmailRepository,
        createUserRepository,
        encrypter: makeEncrypterWithError()
      })
    )
    for (const sut of suts) {
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
      expect(httpResponse.body.error).toBe(new ServerError().message)
    }
  })
})
