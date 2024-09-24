const bcrypt = require('bcrypt')
const MissingParamError = require('../errors/missing-param-error')
const Encrypter = require('./encrypter')

const makeSut = () => {
  return new Encrypter()
}

describe('encrypter', () => {
  test('should return true if bcrypt returns true in compare method', async () => {
    const sut = makeSut()
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(true)
  })

  test('should return false if bcrypt returns false in compare method', async () => {
    const sut = makeSut()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(false)
  })

  test('should call bcrypt with correct values in compare method', async () => {
    const sut = makeSut()
    await sut.compare('any_value', 'hashed_value')
    expect(bcrypt.value).toBe('any_value')
    expect(bcrypt.hashValue).toBe('hashed_value')
  })

  test('should throw if no params are provided in compare method', async () => {
    const sut = makeSut()
    expect(sut.compare()).rejects.toThrow(new MissingParamError('value'))
    expect(sut.compare('any_value')).rejects.toThrow(new MissingParamError('hash'))
  })

  test('should call bcrypt with correct value in encrypt method', async () => {
    const sut = makeSut()
    bcrypt.saltValue = 'any_salt'
    bcrypt.hashResult = 'any_hash'
    const hash = await sut.encrypt('any_value', 10)
    expect(bcrypt.value).toBe('any_value')
    expect(bcrypt.saltRounded).toBe(10)
    expect(bcrypt.salt).toBe('any_salt')
    expect(hash).toBe('any_hash')
  })

  test('should throw if no params are provided in encrypt method', async () => {
    const sut = makeSut()
    expect(sut.encrypt()).rejects.toThrow(new MissingParamError('value'))
    expect(sut.encrypt('any_value')).rejects.toThrow(new MissingParamError('salt'))
  })
})
