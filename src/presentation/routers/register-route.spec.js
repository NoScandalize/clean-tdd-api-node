class RegisterRouter {
  async exec (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return HttpRequest.internalServerError()
    }
    const { username, email, password, confirmPassword } = httpRequest.body
    if (!username) {
      return HttpRequest.badRequest('username')
    }
    if (!email) {
      return HttpRequest.badRequest('email')
    }
    if (!password) {
      return HttpRequest.badRequest('password')
    }
    if (!confirmPassword) {
      return HttpRequest.badRequest('confirmPassword')
    }
  }
}

class HttpRequest {
  static badRequest (paramName) {
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

class MissingParamError extends Error {
  constructor (paramName) {
    super(`Missing param: ${paramName}`)
    this.name = 'MissingParamError'
  }
}

describe('register router', () => {
  test('should return 400 if username is not provided', async () => {
    const sut = new RegisterRouter()
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
    const sut = new RegisterRouter()
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
    const sut = new RegisterRouter()
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
    const sut = new RegisterRouter()
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
    const sut = new RegisterRouter()
    const httpResponse = await sut.exec()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if httpRequest has no body', async () => {
    const sut = new RegisterRouter()
    const httpResponse = await sut.exec({})
    expect(httpResponse.statusCode).toBe(500)
  })
})
