/* eslint-disable no-prototype-builtins */
/* eslint-disable valid-typeof */
class ValidationObject {
  #errors
  #schema
  constructor (schema) {
    this.#errors = {}
    this.#schema = this.#createSchema(schema)
  }

  /**
   * Crea el esquema de validación a partir del esquema de entrada.
   * @private
   * @param {object} schema - El esquema de entrada.
   * @returns {object} - El esquema de validación creado.
   * @throws {Error} - Si el esquema de entrada no es válido.
   */
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

  /**
   * Crea un objeto a partir de un conjunto de claves.
   * @private
   * @param {string[]} keys - Las claves para crear el objeto.
   * @param {object} [lastObj={}] - El último objeto en la cadena de objetos creada.
   * @returns {object} - El objeto creado.
   */
  #createObjectFromKeys (keys, lastObj = {}) {
    return keys.reduceRight((acc, currentKey) => ({ [currentKey]: acc }), lastObj)
  }

  /**
   * Valida un objeto contra un esquema de validación.
   * @private
   * @param {object} obj - El objeto a validar.
   * @param {object|string} schema - El esquema de validación.
   * @param {string[]} [parentKeys=null] - Las claves del objeto padre.
   * @returns {boolean} - `true` si el objeto es válido, `false` en caso contrario.
   */
  #validateObjectAgainstSchema (obj, schema, parentKeys = null) {
    if (typeof schema === 'string' && typeof obj !== 'object') {
      return this.#validateObjectAgainstSchemaString(obj, schema, parentKeys)
    } else {
      for (const key in schema) {
        if (!(key in obj)) {
          if (schema[key].required) {
            this.#setErrorForKey(parentKeys, key, 'Is required')
            return false
          } else {
            continue
          }
        }
        if (!this.#validateObjectKeyType(obj[key], schema[key], parentKeys, key)) {
          return false
        }
        if (schema[key].schema && typeof obj[key] === 'object') {
          if (!this.#validateObjectAgainstSchema(obj[key], schema[key].schema, [...parentKeys ?? [], key])) {
            return false
          }
        }
      }
    }
    return true
  }

  /**
   * Valida un objeto contra un esquema de validación representado como una cadena de caracteres.
   * @private
   * @param {any} obj - El objeto a validar.
   * @param {string} schema - El esquema de validación representado como una cadena de caracteres.
   * @param {string[]} parentKeys - Las claves del objeto padre.
   * @returns {boolean} - `true` si el objeto es válido, `false` en caso contrario.
   */
  #validateObjectAgainstSchemaString (obj, schema, parentKeys) {
    if (typeof obj !== schema) {
      this.#setErrorForKey(parentKeys, null, `item with value '${obj}' of array must be a valid ${schema}.`)
      return false
    }
    return true
  }

  /**
   * Valida el tipo de una propiedad del objeto contra su tipo esperado según el esquema de validación.
   * @private
   * @param {any} value - El valor de la propiedad.
   * @param {object} schema - El esquema de validación para la propiedad.
   * @param {string[]} parentKeys - Las claves del objeto padre.
   * @param {string} key - La clave de la propiedad.
   * @returns {boolean} - `true` si el valor es del tipo esperado, `false` en caso contrario.
   */
  #validateObjectKeyType (value, schema, parentKeys, key) {
    if (typeof value !== schema.type) {
      if (!Array.isArray(value)) {
        this.#setErrorForKey([...parentKeys ?? [], key], null, `${key} must be a valid ${schema.type}.`)
        return false
      }
      for (let i = 0; i < value.length; i++) {
        if (!this.#validateObjectAgainstSchema(value[i], schema.itemSchema, [...parentKeys ?? [], key])) {
          return false
        }
      }
    }
    return true
  }

  /**
   * Setea un error en el objeto de errores `#errors` en la clave dada por `parentKeys` y `key`.
   * Si `parentKeys` es `null`, entonces la clave del error será `key`.
   * Si `key` es `null`, entonces se trata de un error genérico para todos los elementos de un array.
   *
   * @private
   * @param {?string[]} parentKeys - Un array con las claves de las propiedades padres del objeto, en orden descendente.
   * @param {?string} key - La clave de la propiedad del objeto donde ocurrió el error.
   * @param {string} error - El mensaje de error a asignar.
   * @returns {void}
   */
  #setErrorForKey (parentKeys, key, error) {
    if (parentKeys === null) {
      this.#errors = { [key]: { error } }
    } else {
      const resolvedKeys = key ? [...parentKeys, key] : [...parentKeys]
      this.#errors = this.#createObjectFromKeys([...resolvedKeys], { error })
    }
  }

  /**
   * Asigna los valores por defecto para las propiedades del objeto.
   * @private
   * @param {object} schema - El esquema de validación.
   * @param {object} obj - El objeto a asignar valores por defecto.
   */
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

  /**
   * Setea un error en el objeto de errores `#errors` en la clave dada por `parentKeys` y `key`.
   * Si `parentKeys` es `null`, entonces la clave del error será `key`.
   * Si `key` es `null`, entonces se trata de un error genérico para todos los elementos de un array.
   *
   * @private
   * @param {?string[]} parentKeys - Un array con las claves de las propiedades padres del objeto, en orden descendente.
   * @param {?string} key - La clave de la propiedad del objeto donde ocurrió el error.
   * @param {string} error - El mensaje de error a asignar.
   * @returns {void}
   */
  validate (obj, depth = 0, schema = this.#schema) {
    this.#asignedDefaultValues(schema, obj)
    for (const prop in obj) {
      if (typeof obj[prop] === 'object' && obj[prop] !== null) {
        if (!Array.isArray(obj[prop])) {
          this.validate(obj[prop], depth + 1, schema[prop]?.schema)
        }
      } else if (!schema[prop]) {
        delete obj[prop]
      }
    }
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

  blankErrors () {
    this.#errors = {}
  }
}

module.exports = ValidationObject
