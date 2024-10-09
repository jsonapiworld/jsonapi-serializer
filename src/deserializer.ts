import { AttributesObject, DocumentObject, ExistingResourceObject, Options, ResourceObject } from './types'
import { changeCase } from './utils'

type IncludedCache = Record<string, Record<string, unknown>>

/**
 * Deserialize a JSON:API response
 *
 * @param response
 * @param options
 */
export function deserialize<TEntity, TExtraOptions = unknown>(
  response: DocumentObject,
  options: Options<TExtraOptions> = {},
): TEntity | TEntity[] | undefined {
  if (!response.data) {
    return undefined
  }

  const included = response.included || []

  return Array.isArray(response.data)
    ? response.data.map((data) => {
        return parseJsonApiSimpleResourceData(data, included, options, false, {})
      })
    : parseJsonApiSimpleResourceData(response.data, included, options, false, {})
}

function parseJsonApiSimpleResourceData<TEntity, TExtraOptions>(
  data: ResourceObject,
  included: ExistingResourceObject[],
  options: Options<TExtraOptions>,
  useCache: boolean,
  includedCache: IncludedCache,
): TEntity {
  if (!(data.type in includedCache)) {
    includedCache[data.type] = {}
  }

  const id: string | undefined = ((data as ExistingResourceObject) && 'id' in data && data.id) || undefined
  if (useCache && id && id in includedCache[data.type]) {
    return includedCache[data.type][id] as TEntity
  }

  const lid: string | undefined = ((data as ExistingResourceObject) && 'lid' in data && data.lid) || undefined
  if (useCache && lid && lid in includedCache[data.type]) {
    return includedCache[data.type][lid] as TEntity
  }

  let attributes: AttributesObject = data.attributes || {}

  if (options.changeCase) {
    attributes = changeCase(attributes, options.changeCase, options.changeCaseDeep)
  }

  const resource: Record<string, unknown> = {
    ...(id ? { id } : {}),
    ...(lid ? { lid } : {}),
    ...attributes,
  }

  if (data.links) {
    resource['links'] = data.links
  }

  const ensureId = id || lid
  if (ensureId) {
    includedCache[data.type][ensureId] = resource
  }

  if (data.relationships) {
    for (const relationName of Object.keys(data.relationships)) {
      const relationReference = data.relationships[relationName]

      if (!relationReference) {
        continue
      }

      if (Array.isArray(relationReference.data)) {
        resource[relationName] = relationReference.data.map((relationData) => {
          const id: { value: string; field: 'id' | 'lid' } =
            'id' in relationData ? { field: 'id', value: relationData.id } : { field: 'lid', value: relationData.lid }
          return findJsonApiIncluded(included, includedCache, relationData.type, id, options)
        })
      } else if (relationReference && relationReference.data) {
        const relationData = relationReference.data
        const id: { value: string; field: 'id' | 'lid' } =
          'id' in relationData ? { field: 'id', value: relationData.id } : { field: 'lid', value: relationData.lid }

        const relationResource = findJsonApiIncluded<Record<string, unknown>, TExtraOptions>(
          included,
          includedCache,
          relationData.type,
          id,
          options,
        )

        if (relationReference.links) {
          relationResource.links = relationReference.links
        }

        resource[relationName] = relationResource
      }
    }
  }

  return resource as TEntity
}

/**
 *
 * @param included
 * @param includedCache
 * @param type
 * @param id
 * @param id.value
 * @param options
 * @param id.field
 */
function findJsonApiIncluded<TEntity, TExtraOptions>(
  included: ExistingResourceObject[],
  includedCache: IncludedCache,
  type: string,
  id: { value: string; field: 'id' | 'lid' },
  options: Options<TExtraOptions>,
): TEntity {
  const foundResource = included.find((item) => {
    if (item.type !== type) return false
    if (id.field === 'id' && 'id' in item) return item.id === id.value
    if (id.field === 'lid' && 'lid' in item) return item.lid === id.value
    return false
  })

  if (!foundResource) {
    return { [id.field]: id.value } as unknown as TEntity
  }

  return parseJsonApiSimpleResourceData(foundResource, included, options, true, includedCache)
}
