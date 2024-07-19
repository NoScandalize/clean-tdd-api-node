class RegisterRouter {
  async exec (httpRequest) {
    if (!httpRequest.body.username || !httpRequest.body.email) {
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
})
