export class JsonApiSerializerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JsonApiSerializerError'
  }
}
