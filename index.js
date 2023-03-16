class ValidationObject {
  constructor (schema) {
    this.errors = {}
    this.schema = this.#createSchema(schema)
    this.options = {}
  }

  /**
     * Esta funcion recibe un schema obtenido al momento de instanciar la clase y lo parsea de tal manera que se pueda trabajar
     * con un schema limpio y consistente.
     * Esta funcion es recursiva con una complejidad O(n) y ya esta lo suficientemente optimizada. Cualquier algoritmo similar
     * podria tener la misma complejidad o peor.
     * @param {*} schema
     * @returns Schema valido que permite a la instancia de clase validar correctamente las properties del objeto
     * proporcionado
     */
  #createSchema (schema) {
    const newSchema = {}
    for (const [key, value] of Object.entries(schema)) {
      if (typeof value !== 'object' || value.schema === undefined) {
        newSchema[key] = {
          type: value.type ?? value,
          required: value.required ?? true,
          schema: null,
          default: value.default ?? undefined
        }
      } else {
        const childSchema = this.#createSchema(value.schema)
        newSchema[key] = {
          type: 'object',
          required: value.required ?? true,
          schema: childSchema
        }
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
          this.errors = this.#createObjectFromKeys([...parentKeys, key], {
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
      }

      // Verificar el esquema anidado
      if (schema[key].schema && typeof obj[key] === 'object') {
        if (!this.#validateObjectAgainstSchema(obj[key], schema[key].schema, [...parentKeys ?? [], key])) {
          return false
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
        if (schema[prop]?.default !== undefined) {
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
