const RegisterRouter = require('./register-router')
const MissingParamError = require('../helpers/missing-param-error')

const makeSut = () => {
  class AuthUseCaseSpy {
    auth (username, email, password, confirmPassword) {
      this.username = username
      this.email = email
      this.password = password
      this.confirmPassword = confirmPassword
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy()
  const sut = new RegisterRouter(authUseCaseSpy)
  return {
    sut,
    authUseCaseSpy
  }
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

  test('should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.exec()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.exec({})
    expect(httpResponse.statusCode).toBe(500)
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
    expect(authUseCaseSpy.username).toBe(httpRequest.body.username)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
    expect(authUseCaseSpy.confirmPassword).toBe(httpRequest.body.confirmPassword)
  })
})
