# Welcome to Basic Valid Object Schema 👋
![Version](https://img.shields.io/badge/version-0.2.2-blue.svg?cacheSeconds=2592000)
![Prerequisite](https://img.shields.io/badge/npm-%3E%3D8.0.0-blue.svg)
![Prerequisite](https://img.shields.io/badge/node-%3E%3D14.0.0-blue.svg)
[![English- Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/ifritzler/basic-valid-object-schema#readme)
[![Spanish- Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/ifritzler/basic-valid-object-schema/docs/spanish.md)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/ifritzler/basic-valid-object-schema/graphs/commit-activity)
[![License: MIT](https://img.shields.io/github/license/ifritzler/Basic)](https://github.com/ifritzler/basic-valid-object-schema/blob/main/LICENSE.md)

---

[![Alpha Version alert](https://img.shields.io/badge/-ALPHA-yellow?style=for-the-badge)](#) 

```
This is an alpha version of the library and is subject to frequent changes and updates. We do not recommend using this version in production environments.

Please note that there may be breaking changes as we work towards the stable release version 1.0.

We do not assume responsibility for any changes made to the API due to the use of this alpha version.

Please be aware that this software is released under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0). 
```
---



> Validation tool or utility that allows for simple and fast validation of an object against a schema.

### 🏠 [Homepage](https://github.com/ifritzler/basic-valid-object-schema)

## Prerequisites

- npm >=8.0.0
- node >=14.0.0

## Install

```sh
npm install basic-valid-object-schema
```

## Run tests

```sh
npm run test
```
## Tipos de dato soportados
| Tipo de dato | Descripción |
|--------------|-------------|
| `number`     | Números enteros y de punto flotante. |
| `string`     | Cadena de texto. |
| `boolean`    | Valor verdadero o falso. |
| `null`       | Valor nulo, representa la ausencia de valor. |
| `undefined`  | Valor indefinido, representa una variable sin valor asignado. |
| `symbol`     | Valor único e inmutable utilizado como clave de objetos. |
| `bigint`     | Números enteros extremadamente grandes (a partir de ES2020). |
| `array`     | Conjunto de datos agrupados. |

---
## Methods

### ValidationObject.prototype.constructor(schema: object)
### ValidationObject.prototype.validate(o: object)
- Method that validates an object against the schema initialized in the ValidationObject instance.

- Return: {errors: object, data: null | object, isValid: boolean}
---
## Usage/Examples

### Basic Example

First, we create a schema. A **schema** is an object that represents an entity or object to be validated. Each object we want to validate will be validated against the requirements of this schema.

Once the schema is created, wherever we want to perform the validation, we will need to import the library, generate a new instance with the schema to contrast, and use '**validate**' passing the object to validate. This will give us important variables that we can destructure as seen in the code below.

**By default, all properties of a schema are required unless otherwise indicated.**


```javascript
import ValidationObject from 'basic-valid-object-schema';

const createProductSchema = {
    title: {
        type: "string",
        required: true
    }
    price: {
        type: "number",
        required: true
    },
    active: {
        type: "boolean",
        default: true
    },
    categories: {
        type: "array",
        schema: {
            type: "string"
        },
        default: ["category"],
        required: true
    }
}

const okRawProductData = {
  title: "title1",
  price: 300.5
}

const validator = new ValidationObject(createProductSchema)

const {
  // Boolean that indicates whether the object is valid or not
  isValid,
  // Validated object, can be null or an object with processed data ready to be used.
  data,
  // Error object produced during validation, can be null if the object is valid.
  errors
} = validator.validate(badRawProductData);

console.log({ errors, isValid, data });
/*
errors: null,
isValid: true,
data: {
  title: "title1",
  price: 300.5,
  active: true,
  categories: ["category"]
}
*/ 
...

```

Example with the same schema and different input that causes the validation to fail and return an error.

```javascript

const badRawProductData = {
  title: "title1",
  price: "$300.5"
};

const { isValid, data, errors } = validator.validate(badRawProductData);

console.log({ errors, isValid, data });
/*
errors: {
  price: {
    error: "price must be a valid number"
  }
},
isValid: false,
data: null
*/
```

## Options for validate:
| Option     | Description |
|------------|-------------|
| `whitelist` | If the value is `true`, it will clean all properties that are not defined in the schema. If the value is `false`, it will not perform the cleaning and allow the existence of additional properties in the object. This option is useful for validating and ensuring that the data sent to the class object is as expected. |
---
## How to avoid cleaning extra properties from my schema
```javascript

const okRawProductData = {
  title: "title1",
  price: 300.5,
  extraProperty: true
}

const {
  // Boolean indicating whether the object is valid or not
  isValidate,
  // validated object, can be null or an object with processed data ready to be used.
  data, 
  // object of errors produced during validation, can be null if the object is valid.
  errors
} = validate( createProductSchema, badRawProductData, { whitelist: false } )

console.log({errors, isValidate, data})
/*
errors: null,
isValidate: true,
data: {
  title: "title1",
  price: 300.5,
  active: true,
  categories: ["category"],
  extraProperty: true --> Here is the property thanks to whitelist false attribute
}
*/
```

## Shortcut for schema creation:

There is a way to shorten our schemas by leaving the default schema values to do their magic.

To understand this, it is necessary to understand that:
- Properties of each schema are required by default.
- The value of a subschema can be either an object that represents a schema or a string.

The schema seen earlier can be reduced to this:


```javascript
const createProductSchema = {
    title: "string",
    price: "number",
    active: {
        type: "boolean",
        default: true
    },
    categories: {
        type: "array",
        schema: "string",
        default: ["category"],
        required: true
    }
}
```

## Authors

👤 **Ilan Emanuel Fritzler <contacto.fritzlerilan@gmail.com> (http://github.com/ifritzler)**

* Website: http://github.com/ifritzler
* Github: [@ifritzler](https://github.com/ifritzler)
* LinkedIn: [@ilan-fritzler](https://linkedin.com/in/ilan-fritzler)

👤 **Federico Lautaro Hanson <hanson.federico@gmail.com> (http://github.com/FedeLH)**

* Website: http://github.com/FedeLH
* Github: [@FedeLH](https://github.com/FedeLH)
* LinkedIn: [@federico-lautaro-hanson-130944224](https://linkedin.com/in/federico-lautaro-hanson-130944224)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://github.com/ifritzler/basic-valid-object-schema/issues). You can also take a look at the [contributing guide](https://github.com/ifritzler/basic-valid-object-schema/blob/main/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!


## 📝 License

Copyright © 2023 [Ilan Emanuel Fritzler <contacto.fritzlerilan@gmail.com> (http://github.com/ifritzler)](https://github.com/ifritzler).

This project is [Apache 2.0](https://github.com/ifritzler/basic-valid-object-schema/blob/main/LICENSE.md) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_