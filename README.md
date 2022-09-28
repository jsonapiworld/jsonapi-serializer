# jsonapi-serializer
![License](https://img.shields.io/github/license/jsonapiworld/jsonapi-serializer)

JSON:API Serializer

## Installation
```
yarn add @jsonapiworld/jsonapi-serializer
OR
npm install @jsonapiworld/jsonapi-serializer --save
```

## Simple Serialize
```js
// examples/simple-serialize.js

const { serialize, CaseType } = require('@jsonapiworld/jsonapi-serializer')

const entity = {
  id: 1,
  firstName: 'Joe',
  lastName: 'Doe',
  address: {
    id: 1,
  },
  images: [{ id: 1 }, { id: 2 }],
}

const serialized = serialize(entity, 'users', {
  relationships: ['address', 'images'],
  changeCase: CaseType.kebabCase,
})

console.log(JSON.stringify(serialized))

/**
 * OUTPUT:
 *
 * {
 *   "data": {
 *     "id": 1,
 *     "type": "users",
 *     "attributes": {
 *       "first-name": "Joe",
 *       "last-name": "Doe"
 *     },
 *     "relationships": {
 *       "address": {
 *         "data": {
 *           "id": 1,
 *           "type": "address"
 *         }
 *       },
 *       "images": {
 *         "data": [
 *           {
 *             "id": 1,
 *             "type": "images"
 *           },
 *           {
 *             "id": 2,
 *             "type": "images"
 *           }
 *         ]
 *       }
 *     }
 *   }
 * }
 */

```

## Deserialize
```js
// examples/deserialize.js

const { deserialize, CaseType } = require('@jsonapiworld/jsonapi-serializer')

const serializedData = {
  data: {
    id: 'myuserid',
    type: 'users',
    attributes: {
      name: 'Joe',
      'last-name': 'Doe',
    },
  },
}
const entity = deserialize(serializedData, { changeCase: CaseType.camelCase })

console.log(JSON.stringify(entity))

/**
 * OUTPUT:
 *
 * {
 *   "id": "myuserid",
 *   "name": "Joe",
 *   "lastName": "Doe"
 * }
 */

```

## Serialize with transformers
```js
// examples/serialize-with-transformers.js

const { Transformer, DefaultTransformer, transform, whitelist } = require('@jsonapiworld/jsonapi-serializer')

class UserTransformer extends Transformer {
  constructor() {
    super()
    this.type = 'users'
    this.relationships = {
      images: this.images,
    }
  }

  transform(user, options) {
    return whitelist(user, ['_id', 'firstName', 'lastName'])
  }

  images(user, options) {
    return transform()
      .withInput(user.images)
      .withTransformer(new DefaultTransformer('images'))
      .withIncluded(true)
      .toContext()
  }
}

const user = {
  _id: 1,
  firstName: 'Joe',
  lastName: 'Doe',
  images: [{ _id: 5, url: 'http://' }],
}

const serialized = transform()
  .withInput(user)
  .withTransformer(new UserTransformer())
  .withOptions({ idKey: '_id' })
  .serialize()

console.log(JSON.stringify(serialized))

/**
 * OUTPUT:
 *
 * {
 *   "data": {
 *     "id": 1,
 *     "type": "users",
 *     "attributes": {
 *       "firstName": "Joe",
 *       "lastName": "Doe"
 *     },
 *     "relationships": {
 *       "images": {
 *         "data": [
 *           {
 *             "id": 5,
 *             "type": "images"
 *           }
 *         ]
 *       }
 *     }
 *   },
 *   "included": [
 *     {
 *       "id": 5,
 *       "type": "images",
 *       "attributes": {
 *         "url": "http://"
 *       }
 *     }
 *   ]
 * }
 */

```

## Links
- [Documentation](docs/README.md)
- [JSON:API Specification (v1.0)](https://jsonapi.org/format)
