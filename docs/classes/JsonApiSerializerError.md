[@jsonapiworld/jsonapi-serializer](../README.md) / JsonApiSerializerError

# Class: JsonApiSerializerError

## Hierarchy

- `Error`

  ↳ **`JsonApiSerializerError`**

## Table of contents

### Constructors

- [constructor](JsonApiSerializerError.md#constructor)

### Properties

- [message](JsonApiSerializerError.md#message)
- [name](JsonApiSerializerError.md#name)
- [stack](JsonApiSerializerError.md#stack)
- [prepareStackTrace](JsonApiSerializerError.md#preparestacktrace)
- [stackTraceLimit](JsonApiSerializerError.md#stacktracelimit)

### Methods

- [captureStackTrace](JsonApiSerializerError.md#capturestacktrace)

## Constructors

### constructor

• **new JsonApiSerializerError**(`message`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |

#### Overrides

Error.constructor

#### Defined in

[src/errors.ts:2](https://github.com/jsonapiworld/jsonapi-serializer/blob/23c793d/src/errors.ts#L2)

## Properties

### message

• **message**: `string`

#### Inherited from

Error.message

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1041

___

### name

• **name**: `string`

#### Inherited from

Error.name

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1040

___

### stack

• `Optional` **stack**: `string`

#### Inherited from

Error.stack

#### Defined in

node_modules/typescript/lib/lib.es5.d.ts:1042

___

### prepareStackTrace

▪ `Static` `Optional` **prepareStackTrace**: (`err`: `Error`, `stackTraces`: `CallSite`[]) => `any`

#### Type declaration

▸ (`err`, `stackTraces`): `any`

Optional override for formatting stack traces

**`See`**

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

##### Parameters

| Name | Type |
| :------ | :------ |
| `err` | `Error` |
| `stackTraces` | `CallSite`[] |

##### Returns

`any`

#### Inherited from

Error.prepareStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:11

___

### stackTraceLimit

▪ `Static` **stackTraceLimit**: `number`

#### Inherited from

Error.stackTraceLimit

#### Defined in

node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

▸ `Static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Create .stack property on a target object

#### Parameters

| Name | Type |
| :------ | :------ |
| `targetObject` | `object` |
| `constructorOpt?` | `Function` |

#### Returns

`void`

#### Inherited from

Error.captureStackTrace

#### Defined in

node_modules/@types/node/globals.d.ts:4
