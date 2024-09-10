module.exports = class PasswordMismatchError extends Error {
  constructor (message) {
    super(message)
    this.name = 'PasswordMismatchError'
  }
}
