/* eslint-disable valid-typeof */
class ValidationObject {
  constructor (schema) {
    this.errors = {}
    this.schema = this.#createSchema(schema)
    this.options = {}
  }

  #createSchema (schema) {
    const newSchema = {}
    for (const [key, value] of Object.entries(schema)) {
      // TODO: Caso en el que la key evaluada no es un array y no es un objeto
      if (typeof value === 'string' && value !== 'array') {
        newSchema[key] = {
          type: value,
          required: true
        }
        // Le asigno solo el valor por default al schema si lo posee
        if (value.default) newSchema[key].default = value.default

        // TODO: Caso en el que la key evaluada es un objeto sin schema y no es de tipo array
      } else if (typeof value === 'object' && value.schema && !(value.type === 'array')) {
        const childSchema = this.#createSchema(value.schema)
        newSchema[key] = {
          type: 'object',
          required: value.required ?? true,
          schema: childSchema
        }

        // Le asigno solo el valor por default al schema si lo posee
        if (value.default) newSchema[key].default = value.default

        // TODO: Caso en el que la key evaluada es un objeto y tiene schema pero no es un array
      } else if (typeof value === 'object' && value.type !== 'array' && !value.schema) {
        newSchema[key] = {
          type: value.type,
          required: value.required ?? true
        }

        // Le asigno solo el valor por default al schema si lo posee
        if (value.default) newSchema[key].default = value.default
        // TODO: Caso donde el la key evaluada es un objeto y es de tipo array
      } else if (typeof value === 'object' && value.type === 'array') {
        if (!value.schema) {
          throw new Error('A valid array schema needs to have a schema prop assigned.')
        }
        if (Array.isArray(value.schema) || (typeof value.schema !== 'string' && typeof value.schema !== 'object')) {
          throw new Error('A schema of an array must be a valid schema object or string primitive.')
        }
        let childSchema
        if (typeof value.schema === 'object') {
          childSchema = this.#createSchema(value.schema)
        } else {
          childSchema = value.schema
        }
        newSchema[key] = {
          type: 'array',
          isArray: true,
          required: value.required ?? true,
          itemSchema: childSchema
        }

        // Le asigno solo el valor por default al schema si lo posee
        if (value.default) newSchema[key].default = value.default

        // TODO: Caso donde el la key evaluada es un string "array"
      } else if (value === 'array') {
        throw new Error('If prop are from type array, the schema needs to be an object with the type array and a valid schema')
      }
    }
    return newSchema
  }

  #createObjectFromKeys (keys, lastObj = {}) {
    // Tomar la primera key del arreglo
    const currentKey = keys[0]

    // Crear un objeto vacío para almacenar la siguiente key
    const nestedObj = {}

    // Si no es la última clave, pasar el objeto anterior al siguiente nivel de la recursión
    if (keys.length > 1) {
      nestedObj[currentKey] = this.#createObjectFromKeys(keys.slice(1), lastObj)
    } else {
      // Si es la última clave, asignar el objeto anterior a la clave actual
      nestedObj[currentKey] = lastObj
    }

    return nestedObj
  }

  #validateObjectAgainstSchema = (obj, schema, parentKeys = null) => {
    if (typeof schema === 'string' && typeof obj !== 'object') {
      if (typeof obj !== schema) {
        this.errors = this.#createObjectFromKeys([...parentKeys ?? []], {
          error: `item with value '${obj}' of array must be a valid ${schema}.`
        })
        return false
      }
    } else {
      for (const key in schema) {
        // Si la propiedad no está en el objeto, devolver false si es requerida, de lo contrario, pasar a la siguiente propiedad
        if (!(key in obj)) {
          if (schema[key].required) {
            if (parentKeys === null) {
              this.errors[key] = {
                error: 'Is required'
              }
              return false
            }
            this.errors = this.#createObjectFromKeys([...parentKeys ?? [], key], {
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
              this.errors[key] = {
                error: `${key} must be a valid ${schema[key].type}.`
              }
            } else {
              this.errors = this.#createObjectFromKeys([...parentKeys, key], {
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
    for (const prop in schema) {
      // Si la propiedad no está definida en el objeto, asignar el valor por defecto del schema (si está definido) a la propiedad
      if (!obj[prop]) {
        if (schema[prop]?.default) {
          obj[prop] = schema[prop].default
        } else {
          delete obj[prop]
        }
      }
    }
  }

  // Si required no viene definido es true
  // Las props del schema pueden ser un string indicando el type o un objeto con props {required, type, }
  validate (obj, depth = 0, schema = this.schema) {
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
      isValidate: Object.entries(this.errors).length === 0,
      errors: this.errors,
      data: Object.entries(this.errors).length === 0 ? obj : null
    }
  };
}

module.exports = ValidationObject
