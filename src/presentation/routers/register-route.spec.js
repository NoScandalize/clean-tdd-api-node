class RegisterRouter {
  async exec (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return {
        statusCode: 500
      }
    }
    const { username, email, password, confirmPassword } = httpRequest.body
    if (!username || !email || !password || !confirmPassword) {
      return {
        statusCode: 400
      }
    }
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
