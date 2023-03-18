/* eslint-disable no-prototype-builtins */
/* eslint-disable valid-typeof */
class ValidationObject {
  #errors
  #schema
  #options
  constructor (schema) {
    this.#errors = {}
    this.#schema = this.#createSchema(schema)
    this.#options = {}
  }

  #createSchema (schema) {
    const newSchema = {}

    for (const [key, value] of Object.entries(schema)) {
      if (typeof value === 'object') {
        if (value.type === 'array') {
          if (!value.schema) {
            throw new Error('A valid array schema needs to have a schema prop assigned.')
          }
          if (Array.isArray(value.schema) || (typeof value.schema !== 'string' && typeof value.schema !== 'object')) {
            throw new Error('A schema of an array must be a valid schema object or string primitive.')
          }
          const childSchema = typeof value.schema === 'object' ? this.#createSchema(value.schema) : value.schema

          newSchema[key] = {
            type: 'array',
            isArray: true,
            required: value.required ?? true,
            itemSchema: childSchema
          }
        } else if (!value.schema) {
          newSchema[key] = {
            type: value.type,
            required: value.required ?? true
          }
        } else {
          const childSchema = this.#createSchema(value.schema)

          newSchema[key] = {
            type: 'object',
            required: value.required ?? true,
            schema: childSchema
          }
        }
      } else if (value !== 'array') {
        newSchema[key] = {
          type: value,
          required: true
        }
      } else {
        throw new Error('If prop are from type array, the schema needs to be an object with the type array and a valid schema')
      }

      if (value && value.default) {
        newSchema[key].default = value.default
      }
    }

    return newSchema
  }

  #createObjectFromKeys (keys, lastObj = {}) {
    return keys.reduceRight((acc, currentKey) => ({ [currentKey]: acc }), lastObj)
  }

  #validateObjectAgainstSchema (obj, schema, parentKeys = null) {
    if (typeof schema === 'string' && typeof obj !== 'object') {
      if (typeof obj !== schema) {
        this.#errors = this.#createObjectFromKeys([...parentKeys ?? []], {
          error: `item with value '${obj}' of array must be a valid ${schema}.`
        })
        return false
      }
    } else {
      for (const key in schema) {
        // Si la propiedad no está en el objeto, devolver false si es requerida, de lo contrario, pasar a la siguiente propiedad
        if (typeof obj === 'object' && !Array.isArray(obj) && !(key in obj)) {
          if (schema[key].required) {
            if (parentKeys === null) {
              this.#errors[key] = {
                error: 'Is required'
              }
              return false
            }
            this.#errors = this.#createObjectFromKeys([...parentKeys ?? [], key], {
              error: 'Is required'
            })
            return false
          } else {
            continue
          }
        }
        // Verificar el tipo de dato
        // eslint-disable-next-line valid-typeof
        if (typeof obj[key] !== schema[key].type) {
          if (!Array.isArray(obj[key])) {
            if (parentKeys === null) {
              this.#errors[key] = {
                error: `${key} must be a valid ${schema[key].type}.`
              }
            } else {
              this.#errors = this.#createObjectFromKeys([...parentKeys, key], {
                error: `${key} must be a valid ${schema[key].type}.`
              })
            }
            return false
          }
          for (let i = 0; i < obj[key].length; i++) {
            if (!this.#validateObjectAgainstSchema(obj[key][i], schema[key].itemSchema, [...parentKeys ?? [], key])) {
              return false
            }
          }
        }
        // Verificar el esquema anidado
        if (schema[key].schema && typeof obj[key] === 'object') {
          if (!this.#validateObjectAgainstSchema(obj[key], schema[key].schema, [...parentKeys ?? [], key])) {
            return false
          }
        }
      }
    }
    // Si llegamos aquí, el objeto coincide con el esquema
    return true
  }

  #asignedDefaultValues (schema, obj) {
    for (const [prop, { default: defaultValue }] of Object.entries(schema)) {
      if (!(prop in obj)) {
        if (defaultValue !== undefined) {
          obj[prop] = defaultValue
        } else {
          delete obj[prop]
        }
      }
    }
  }

  // Si required no viene definido es true
  // Las props del schema pueden ser un string indicando el type o un objeto con props {required, type, }

  validate (obj, depth = 0, schema = this.#schema) {
    this.#asignedDefaultValues(schema, obj)
    // Elimina propiedades que no esten dentro del schema
    for (const prop in obj) {
      if (typeof obj[prop] === 'object' && obj[prop] !== null) {
        // Si la propiedad es un objeto, llamar recursivamente la función `validate`
        if (!Array.isArray(obj[prop])) {
          this.validate(obj[prop], depth + 1, schema[prop]?.schema)
        }
      } else if (!schema[prop]) {
        // Si la propiedad no está definida en el schema, eliminarla
        delete obj[prop]
      }
    }
    // Valida contra el schema si las propiedades cumplen con lo solicitado
    this.#validateObjectAgainstSchema(obj, schema)
    return {
      isValidate: Object.entries(this.#errors).length === 0,
      errors: this.#errors,
      data: Object.entries(this.#errors).length === 0 ? obj : null
    }
  }

  getSchema () {
    return this.#schema
  }

  getErrors () {
    return this.#errors
  }

  blankErrors () {
    this.#errors = {}
  }
}

module.exports = ValidationObject
