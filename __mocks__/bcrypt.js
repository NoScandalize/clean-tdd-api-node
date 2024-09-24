module.exports = {
  isValid: true,
  value: '',
  hashValue: '',
  saltRounded: 0,
  saltValue: '',
  salt: '',

  async compare (value, hashValue) {
    this.value = value
    this.hashValue = hashValue
    return this.isValid
  },

  async genSalt (saltRounded) {
    this.saltRounded = saltRounded
    return this.saltValue
  },

  async hash (value, salt) {
    this.value = value
    this.salt = salt
    return this.hashResult
  }
}
