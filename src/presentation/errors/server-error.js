module.exports = class ServerError extends Error {
  constructor (paramName) {
    super('An internal error occurred')
    this.name = 'ServerError'
  }
}
