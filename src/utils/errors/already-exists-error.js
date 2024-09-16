module.exports = class AlreadyExistsError extends Error {
  constructor (paramName) {
    super(`This ${paramName} is already in use.`)
    this.name = 'AlreadyExistsError'
  }
}
