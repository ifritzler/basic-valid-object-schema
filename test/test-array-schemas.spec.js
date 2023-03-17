const ValidationObject = require('..')
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

describe('Implementation of array schemas', () => {
  const localSchema = JSON.parse(JSON.stringify(baseSchema))
  const validationObject = new ValidationObject(localSchema)

  beforeEach(() => {
    validationObject.errors = {}
  })

  test('when i pass a schema with arrays, this should be created fine', () => {
    const testSchema = {
      title: { type: 'string', required: true },
      description: { type: 'string', required: true },
      stock: { type: 'number', required: true },
      active: { type: 'boolean', required: true },
      categories: { type: 'array', isArray: true, required: true, itemSchema: 'string' }
    }

    const validationTestObject = new ValidationObject(baseSchema)
    expect(validationTestObject.schema).toStrictEqual(testSchema)
  })

  test('a prop with an array schema of strings must be valid', () => {
    const inputObject = {
      title: 'string',
      description: 'string',
      stock: 12,
      active: true,
      categories: ['category 1', 'category2']
    }
    const { errors, data, isValidate } = validationObject.validate(inputObject)

    expect(errors).toStrictEqual({})
    expect(data).toStrictEqual({
      title: 'string',
      description: 'string',
      stock: 12,
      active: true,
      categories: ['category 1', 'category2']
    })
    expect(isValidate).toBeTruthy()
  })
})
