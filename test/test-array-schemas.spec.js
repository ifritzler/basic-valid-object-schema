/* eslint-disable no-unused-vars */
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
    validationObject.blankErrors()
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
    expect(validationTestObject.getSchema()).toStrictEqual(testSchema)
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

  test('when i pass a invalid array type schema, throw an error', () => {
    try {
      const testValidationObject = new ValidationObject({ baseSchema, categories: 'array' })
    } catch (error) {
      expect(error.message).toEqual('If prop are from type array, the schema needs to be an object with the type array and a valid schema')
    }
  })

  test('A valid array schema needs to have a schema prop assigned.', () => {
    try {
      const testValidationObject = new ValidationObject({ baseSchema, categories: { type: 'array' } })
    } catch (error) {
      expect(error.message).toEqual('A valid array schema needs to have a schema prop assigned.')
    }
  })

  test('A schema of an array must be a valid schema object or string primitive.', () => {
    try {
      const testValidationObject = new ValidationObject({ baseSchema, categories: { type: 'array', schema: ['hello i am an error'] } })
    } catch (error) {
      expect(error.message).toEqual('A schema of an array must be a valid schema object or string primitive.')
    }
  })

  test('Supports item array schemas', () => {
    const testValidationObject = new ValidationObject({ ...baseSchema, categories: { type: 'array', schema: { name: 'string', value: 'number' } } })
    expect(testValidationObject.getSchema()).toStrictEqual({
      title: { type: 'string', required: true },
      description: { type: 'string', required: true },
      stock: { type: 'number', required: true },
      active: { type: 'boolean', required: true },
      categories: { type: 'array', isArray: true, required: true, itemSchema: { name: { type: 'string', required: true }, value: { type: 'number', required: true } } }
    })
  })

  test('checks items into arrays - supports item array schemas', () => {
    const testValidationObject = new ValidationObject({ ...baseSchema, categories: { type: 'array', schema: { name: 'string', value: 'number' } } })
    const inputObject = {
      title: 'Test title',
      description: 'Test description',
      stock: 20,
      active: true,
      categories: [{ name: 'category2', value: 2 }, { name: 'category1', value: 1 }]
    }

    const { errors, data, isValidate } = testValidationObject.validate(inputObject)

    expect(errors).toStrictEqual({})
    expect(data).toStrictEqual(inputObject)
    expect(isValidate).toBeTruthy()
  })

  test('checks items into arrays with error - supports item array schemas', () => {
    const testValidationObject = new ValidationObject({ ...baseSchema, categories: { type: 'array', schema: { name: 'string', value: 'number' } } })
    const inputObject = {
      title: 'Test title',
      description: 'Test description',
      stock: 20,
      active: true,
      categories: [{ name: 'category2', value: '2' }, { name: 'category1', value: 1 }]
    }

    const { errors, data, isValidate } = testValidationObject.validate(inputObject)

    expect(errors).toStrictEqual({ categories: { value: { error: 'value must be a valid number.' } } })
    expect(data).toBeNull()
    expect(isValidate).toBeFalsy()
  })

  test('checks items into arrays with error 2  - supports item array schemas', () => {
    const testValidationObject = new ValidationObject({ ...baseSchema, categories: { type: 'array', schema: 'string' } })
    const inputObject = {
      title: 'Test title',
      description: 'Test description',
      stock: 20,
      active: true,
      categories: ['category1', 3]
    }

    const { errors, data, isValidate } = testValidationObject.validate(inputObject)

    expect(errors).toStrictEqual({ categories: { error: "item with value '3' of array must be a valid string." } })
    expect(data).toBeNull()
    expect(isValidate).toBeFalsy()
  })
})
