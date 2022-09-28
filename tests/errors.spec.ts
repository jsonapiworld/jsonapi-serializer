import { JsonApiSerializerError } from '../src/errors'

describe('JsonApiSerializerError', () => {
  describe('constructor', () => {
    it('should set the name', () => {
      const error = new JsonApiSerializerError('my message')
      expect(error.name).toEqual('JsonApiSerializerError')
      expect(error.message).toEqual('my message')
    })
  })
})
