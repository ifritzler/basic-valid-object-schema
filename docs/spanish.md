# Welcome to Basic Valid Object Schema 👋
![Version](https://img.shields.io/badge/version-0.2.2-blue.svg?cacheSeconds=2592000)
![Prerequisite](https://img.shields.io/badge/npm-%3E%3D7.0.0-blue.svg)
![Prerequisite](https://img.shields.io/badge/node-%3E%3D12.0.0-blue.svg)
[![English- Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/ifritzler/basic-valid-object-schema#readme)
[![Spanish- Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/ifritzler/basic-valid-object-schema/docs/spanish.md)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/ifritzler/basic-valid-object-schema/graphs/commit-activity)
[![License: MIT](https://img.shields.io/github/license/ifritzler/Basic)](https://github.com/ifritzler/basic-valid-object-schema/blob/main/LICENSE.md)

---

[![ALERTA - Alpha Version](https://img.shields.io/badge/-ALPHA-yellow?style=for-the-badge)](#) 

```
Esta es una versión alfa de la biblioteca y está sujeta a cambios y actualizaciones frecuentes. No recomendamos usar esta versión en entornos de producción.

Tenga en cuenta que puede haber cambios disruptivos a medida que trabajamos hacia la versión estable de lanzamiento 1.0.

No asumimos responsabilidad por ningún cambio hecho en la API debido al uso de esta versión alfa.

Tenga en cuenta que este software se publica bajo la [Licencia Apache 2.0] (https://www.apache.org/licenses/LICENSE-2.0). 
```
---

> Herramienta o utilidad de validación que permite la validación simple y rápida de un objeto contra un esquema.

### 🏠 [Homepage](https://github.com/ifritzler/basic-valid-object-schema)

## Pre requisitos

- npm >=8.0.0
- node >=14.0.0

## Instalación

```sh
npm install basic-valid-object-schema
```

## Correr tests

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
## Metodos

### BasicValidationClass.prototype.constructor(schema: object): BasicValidationClass
### BasicValidationClass.prototype.validate(o: object): {errors, data, isValidate}
- Metodo que valida un objeto contra el schema inicializado en la instancia de ValidationObject.
### validate(schema: object, o: object): {errors, data, isValidate}
- Return: {errors: object, data: null | object, isValidate: boolean}
---
## Uso/Ejemplos

## Ejemplo basico

Primero creemos un schema. Un **schema** es un objecto que representa una entidad o objecto a validar. Cada objeto que querramos validar sera validado contra los requerimientos de este schema.

Una vez creado el schema, donde queramos realizar la validacion necesitaremos importar la libreria, generar una nueva instancia con el schema a contrastar, y utilizar '**validate**' pasandole el objeto a validar. Esto ultimo nos dara importantes variables que podremos desestructurar como se ve en el codigo debajo.


**Por defecto todas las propiedades de un schema son requeridas salvo que se indique lo contrario.**

```javascript
import { validate } from 'basic-valid-object-schema';

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

const {
  // Booleano que indica si el objeto es valido o no
  isValidate,
  // objeto validado, puede ser null o un object con los datos procesados y listos para ser utilizados.
  data, 
  // object de errores producidos durante validacion, puede ser null en caso de que sea valido el objeto.
  errors
} = validate( createProductSchema, badRawProductData )

console.log({errors, isValidate, data})
/*
errors: null,
isValidate: true,
data: {
  title: "title1",
  price: 300.5,
  active: true,
  categories: ["category"]
}
*/
...

```

Ejemplo con el mismo schema y diferente input que genera que la validacion falle y de un error.

```javascript

const badRawProductData = {
  title: "title1",
  price: "$300.5"
}

const { isValidate, data, errors } = validate( createProductSchema, badRawProductData )

console.log({errors, isValidate, data})
/*
errors: {
  price: {
    error: "price must be a valid number"
  }
},
isValidate: false,
data: null
*/
```

## Opciones para validate:
| Opción     | Descripción |
|------------|-------------|
| `whitelist` | Si el valor es `true`, limpiará todas las propiedades que no estén definidas en el schema. Si el valor es `false`, no realizará la limpieza y permitirá la existencia de propiedades adicionales en el objeto. Esta opción es útil para validar y asegurar que los datos enviados al objeto de la clase son los esperados. |
---
## Como evitar que se limpien las propiedades extras a mi schema
```javascript

const okRawProductData = {
  title: "title1",
  price: 300.5,
  extraProperty: true
}

const {
  // Booleano que indica si el objeto es valido o no
  isValidate,
  // objeto validado, puede ser null o un object con los datos procesados y listos para ser utilizados.
  data, 
  // object de errores producidos durante validacion, puede ser null en caso de que sea valido el objeto.
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

## Atajo para la creacion de schemas:

Existe una manera de acortar nuestros schemas, dejando los valores de schemas por defecto que hagan su magia.

Para poder coomprender esto es necesario entender que:
- Las propiedades de cada schema son requeridas por defecto.
- El valor de un subschema puede ser igual a un object que represente a un schema o un string.

El schema visto anteriormente puede ser reducido a esto:

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

## Autores

👤 **Ilan Emanuel Fritzler <contacto.fritzlerilan@gmail.com> (http://github.com/ifritzler)**

* Website: http://github.com/ifritzler
* Github: [@ifritzler](https://github.com/ifritzler)
* LinkedIn: [@ilan-fritzler](https://linkedin.com/in/ilan-fritzler)

👤 **Federico Lautaro Hanson <hanson.federico@gmail.com> (http://github.com/FedeLH)**

* Website: http://github.com/FedeLH
* Github: [@FedeLH](https://github.com/FedeLH)
* LinkedIn: [@federico-lautaro-hanson-130944224](https://linkedin.com/in/federico-lautaro-hanson-130944224)

## 🤝 Contributing

Contribuciones, issues y feature requests son bienvenidas!

Sientanse libres de revisar [pagina de issues](https://github.com/ifritzler/basic-valid-object-schema/issues). Puedes tambien echar un vistazo a la [guia de contribucion](https://github.com/ifritzler/basic-valid-object-schema/blob/main/CONTRIBUTING.md).

## Muestra tu apoyo

Danos una ⭐️ si este proyecto te ha ayudado!


## 📝 Licencia

Copyright © 2023 [Ilan Emanuel Fritzler <contacto.fritzlerilan@gmail.com> (http://github.com/ifritzler)](https://github.com/ifritzler).

This project is [Apache 2.0](https://github.com/ifritzler/basic-valid-object-schema/blob/main/LICENSE.md) licensed.

***
_Este readme ha sido generado con ❤️ por [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_