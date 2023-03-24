const { validate } = require('..')

const baseSchema = {
  title: 'string',
  description: 'string',
  stock: 'number',
  active: 'boolean',
  categories: {
    type: 'array',
    schema: 'string'
  }
}

describe('Validating a 1 level depth schema with primitive and non primitive types', () => {
  test('input object is a valid schema', async () => {
    const obj = { title: 'test title', description: 'test desc', stock: 25, active: true, categories: ['category'] }
    const { isValidate, errors, data } = await validate(baseSchema, obj)
    expect(isValidate).toBe(true)
    expect(data).toStrictEqual({ title: 'test title', description: 'test desc', stock: 25, active: true, categories: ['category'] })
    expect(errors).toStrictEqual({})
  })

  test('props are required by default', async () => {
    const obj = { description: 'test desc', stock: 25, active: true, categories: ['category'] }
    const { isValidate, errors, data } = await validate(baseSchema, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ title: { error: 'Is required' } })
  })

  test('prop number must be a valid number', async () => {
    const obj = { title: 'test title', description: 'test desc', stock: '25', active: true, categories: ['category'] }
    const { isValidate, errors, data } = await validate(baseSchema, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ stock: { error: 'stock must be a valid number.' } })
  })

  test('prop string must be a valid string', async () => {
    const obj = { title: 'test title', description: 2, stock: 25, active: true, categories: ['category'] }
    const { isValidate, errors, data } = await validate(baseSchema, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ description: { error: 'description must be a valid string.' } })
  })

  test('prop boolean must be a valid boolean', async () => {
    const obj = { title: 'test title', description: 'test desc', stock: 25, active: 'true', categories: ['category'] }
    const { isValidate, errors, data } = await validate(baseSchema, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ active: { error: 'active must be a valid boolean.' } })
  })

  test('prop array must be a valid array', async () => {
    const obj = { title: 'test title', description: 'test desc', stock: 25, active: true, categories: 'category' }
    const { isValidate, errors, data } = await validate(baseSchema, obj)
    expect(isValidate).toBe(false)
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ categories: { error: 'categories must be a valid array.' } })
  })
})

describe('Validating a 2 level depth schema with primitive and non primitive types', () => {
  const baseSchemaModify = { ...baseSchema, origin: { schema: { country: 'string', city: 'string' } } }
  const baseTestItem = { title: 'test title', description: 'test desc', stock: 25, active: true, categories: ['category'], origin: { country: 'Argentina', city: 'MDP' } }
  test('input object is a valid schema', async () => {
    const obj = JSON.parse(JSON.stringify(baseTestItem))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    expect(isValidate).toBe(true)
    expect(data).toStrictEqual(baseTestItem)
    expect(errors).toStrictEqual({})
  })

  test('props first level - required by default', async () => {
    const { origin, ...obj } = JSON.parse(JSON.stringify(baseTestItem))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ origin: { error: 'Is required' } })
  })

  test('props second level - required by default', async () => {
    const obj = JSON.parse(JSON.stringify(baseTestItem))
    delete obj.origin.city
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ origin: { city: { error: 'Is required' } } })
  })

  test('prop number must be a valid number', async () => {
    const obj = JSON.parse(JSON.stringify({ ...baseTestItem, stock: '25' }))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ stock: { error: 'stock must be a valid number.' } })
  })

  test('prop string must be a valid string', async () => {
    const obj = JSON.parse(JSON.stringify({ ...baseTestItem, origin: { ...baseTestItem.origin, city: 12 } }))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    expect(isValidate).toBeFalsy()
    expect(data).toBeNull()
    expect(errors).toStrictEqual({ origin: { city: { error: 'city must be a valid string.' } } })
  })
})

describe('Validating default values', () => {
  const baseSchemaModify = {
    ...baseSchema,
    title: { type: 'string', default: 'title' },
    origin: {
      schema: {
        country: {
          type: 'string',
          default: 'Argentina'
        },
        city: 'string'
      }
    }
  }
  const inputTestItem = { description: 'test desc', stock: 25, active: true, categories: ['category'], origin: { city: 'MDP' } }

  test('if a prop have a default value and does not on input object, then default value appears', async () => {
    const obj = JSON.parse(JSON.stringify(inputTestItem))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    const responseTestItem = { title: 'title', description: 'test desc', stock: 25, active: true, categories: ['category'], origin: { country: 'Argentina', city: 'MDP' } }
    expect(isValidate).toBe(true)
    expect(data).toStrictEqual(responseTestItem)
    expect(errors).toStrictEqual({})
  })
})

describe('Validating non required values', () => {
  const baseSchemaModify = { ...baseSchema, title: { type: 'string', required: false } }
  const inputTestItem = { description: 'test desc', stock: 25, active: true, categories: ['category'] }

  test('if a prop is a non required field ignore it', async () => {
    const obj = JSON.parse(JSON.stringify(inputTestItem))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    const responseTestItem = { description: 'test desc', stock: 25, active: true, categories: ['category'] }
    expect(errors).toStrictEqual({})
    expect(data).toStrictEqual(responseTestItem)
    expect(isValidate).toBe(true)
  })
})

describe('Deleting all fields that not match with the schema', () => {
  const baseSchemaModify = { ...baseSchema, title: { type: 'string', required: false } }
  const inputTestItem = { title: 'test title', description: 'test desc', stock: 25, active: true, categories: ['category'], saraza: 'saraza', query: 'SELECT *' }

  test('if a prop is a non required field ignore it', async () => {
    const obj = JSON.parse(JSON.stringify(inputTestItem))
    const { isValidate, errors, data } = await validate(baseSchemaModify, obj)
    const responseTestItem = { title: 'test title', description: 'test desc', stock: 25, active: true, categories: ['category'] }
    expect(errors).toStrictEqual({})
    expect(data).toStrictEqual(responseTestItem)
    expect(isValidate).toBe(true)
  })

  test('case with a prop object that is not an array but have schema', async () => {
    const baseSchemaModify2 = { ...baseSchema, address: { schema: { street: 'string', number: 'number' } } }
    const obj = JSON.parse(JSON.stringify({ ...inputTestItem, address: { street: 'Street', number: 123 } }))
    const { isValidate, errors, data } = await validate(baseSchemaModify2, obj)
    const responseTestItem = { title: 'test title', description: 'test desc', stock: 25, active: true, categories: ['category'], address: { street: 'Street', number: 123 } }
    expect(errors).toStrictEqual({})
    expect(data).toStrictEqual(responseTestItem)
    expect(isValidate).toBe(true)
  })
})

describe('Verify data with whitelist false works', () => {
  test('first level', async () => {
    const { data, errors, isValidate } = await validate(baseSchema, { title: '1', description: '2', price: 3, stock: 4, active: true, categories: ['6', '7'], saraza: true }, { whitelist: false })
    expect(errors).toStrictEqual({})
    expect(data).not.toBeNull()
    expect(data.saraza).toBeDefined()
    expect(isValidate).toBe(true)
  })

  test('second level', async () => {
    const { data, errors, isValidate } = await validate({ ...baseSchema, address: { schema: { street: 'string', number: 'number' } } }, { title: '1', description: '2', price: 3, stock: 4, active: true, categories: ['6', '7'], address: { street: 'strobel', number: 4051, saraza: true } }, { whitelist: false })
    expect(errors).toStrictEqual({})
    expect(data).not.toBeNull()
    expect(data.address.saraza).toBeDefined()
    expect(isValidate).toBe(true)
  })
})
