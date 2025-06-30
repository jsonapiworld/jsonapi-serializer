import { Context, ContextBuilder } from './context'
import { DefaultTransformer } from './default-transformer'
import { Transformer } from './transformer'
import {
  Options,
  DocumentObject,
  ResourceObject,
  RelationshipObject,
  NewResourceObject,
  ResourceIdentifierObject,
  SerializeOptions,
} from './types'
import { whitelist, changeCase } from './utils'
import { JsonApiSerializerError } from './errors'

type IncludedRecord = Record<string, Record<string, ResourceObject>>

/**
 * Create a ContextBuilder, used to configure the transformation
 */
export function transform<TEntity, TExtraOptions = unknown>(): ContextBuilder<TEntity, TExtraOptions> {
  return new ContextBuilder(serializeContext)
}

/**
 * Serialize the entity
 *
 * @param data entity to be serialized
 * @param type type of the entity
 * @param options options used in the serialization
 */
export function serialize<TEntity, TExtraOptions = unknown>(
  data: TEntity,
  type: string,
  options?: SerializeOptions<TExtraOptions>,
): DocumentObject {
  if (!options) {
    options = {} as SerializeOptions<TExtraOptions>
  }

  return transform()
    .withInput(data)
    .withTransformer(new DefaultTransformer(type, options.relationships || []))
    .withOptions(options)
    .serialize()
}

function serializeContext<TEntity, TExtraOptions = unknown>(context: Context<TEntity, TExtraOptions>): DocumentObject {
  if (!context.input) {
    // eslint-disable-next-line unicorn/no-null
    return { data: null }
  }

  const includedByType: IncludedRecord = {}

  const data = Array.isArray(context.input)
    ? context.input.map((entity) => serializeEntity(entity, context.transformer, context.options, includedByType))
    : serializeEntity(context.input, context.transformer, context.options, includedByType)

  const included: ResourceObject[] = []

  for (const type of Object.keys(includedByType)) {
    for (const id of Object.keys(includedByType[type])) {
      included.push(includedByType[type][id])
    }
  }

  return {
    data,
    ...(included.length > 0 ? { included } : {}),
  } as DocumentObject
}

function serializeEntity<TEntity, TExtraOptions>(
  entity: TEntity,
  transformer: Transformer<TEntity, TExtraOptions>,
  options: Options<TExtraOptions>,
  includedByType: IncludedRecord,
): ResourceObject | NewResourceObject {
  let attributes = { ...transformer.transform(entity, options) }
  const idKey = options.idKey || 'id'
  const id: string | undefined =
    (attributes[idKey] as string) || (entity as unknown as Record<string, string>)[idKey] || undefined

  const lid = (!id && (entity as unknown as Record<string, string>).lid) || undefined

  delete attributes[idKey]
  delete attributes.lid

  const relationships: Record<string, RelationshipObject> = {}

  for (const relation of Object.keys(transformer.relationships)) {
    const context: Context<unknown, TExtraOptions> = {
      ...transformer.relationships[relation](entity, options),
      options,
    }

    if (Array.isArray(context.input)) {
      relationships[relation] = {
        data: context.input
          .map((inputItem) => serializeRelation({ ...context, input: inputItem }, includedByType))
          .filter((identifier) => !!identifier) as ResourceIdentifierObject[],
      }
    } else if (context.input !== undefined) {
      relationships[relation] = {
        data: serializeRelation(context, includedByType) as ResourceIdentifierObject,
      }
    }
  }

  if (options.fields && options.fields[transformer.type]) {
    attributes = whitelist(attributes, options.fields[transformer.type])
  }

  if (options.changeCase) {
    attributes = changeCase(attributes, options.changeCase, options.changeCaseDeep)
  }

  const data: Omit<ResourceObject, 'id' | 'lid'> & { id?: string; lid?: string } = {
    type: transformer.type,
    attributes,
    relationships,
  }

  if (id) {
    data.id = id
  } else if (lid) {
    data.lid = lid
  }

  if (data.relationships && Object.keys(data.relationships).length === 0) {
    delete data.relationships
  }

  return data
}

function serializeRelation<TEntity = unknown, TExtraOptions = unknown>(
  context: Context<TEntity, TExtraOptions> & { input: TEntity },
  includedByType: IncludedRecord,
): ResourceIdentifierObject | undefined | null {
  const { input: entity, options, transformer, included } = context

  const idKey = options.idKey || 'id'

  if (entity === null) {
    return null
  }

  if (!entity) {
    return undefined
  }

  const id = (entity as unknown as Record<string, string>)[idKey]
  const lid = (entity as unknown as Record<string, string>).lid

  if (!id && !lid) {
    throw new JsonApiSerializerError('Resource without id or lid')
  }

  if (included) {
    if (!(transformer.type in includedByType)) {
      includedByType[transformer.type] = {}
    }

    if (!(id in includedByType[transformer.type])) {
      includedByType[transformer.type][id ?? lid] = serializeEntity(
        entity,
        transformer,
        options,
        includedByType,
      ) as ResourceObject
    }
  }

  if (id) {
    return {
      type: transformer.type,
      id,
    }
  }
  return {
    type: transformer.type,
    lid,
  }
}
