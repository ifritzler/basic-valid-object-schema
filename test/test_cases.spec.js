const ValidationObject = require("..");

const baseSchema = {
    title: "string",
    description: "string",
    stock: "number",
    active: "boolean",
    categories: "array",
}

describe('Validating a 1 level depth schema with primitive and non primitive types', () => {
    const validationObject = new ValidationObject(baseSchema);

    afterEach(() => {
        validationObject.errors = {}
    })

    test("input object is a valid schema", () => {
        const obj = { title: "test title", description: "test desc", stock: 25, active: true, categories: ["category"] };
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBe(true)
        expect(data).toStrictEqual({ title: "test title", description: "test desc", stock: 25, active: true, categories: ["category"] })
        expect(errors).toStrictEqual({})
    })

    test("props are required by default", () => {
        const obj = { description: "test desc", stock: 25, active: true, categories: ["category"] };
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ title: { error: "Is required" } })
    })

    test("prop number must be a valid number", () => {
        const obj = { title: "test title", description: "test desc", stock: "25", active: true, categories: ["category"] };
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ stock: { error: "stock must be a valid number." } })
    })

    test("prop string must be a valid string", () => {
        const obj = { title: "test title", description: 2, stock: 25, active: true, categories: ["category"] };
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ description: { error: "description must be a valid string." } })
    })

    test("prop boolean must be a valid boolean", () => {
        const obj = { title: "test title", description: "test desc", stock: 25, active: "true", categories: ["category"] };
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ active: { error: "active must be a valid boolean." } })
    })

    test("prop array must be a valid array", () => {
        const obj = { title: "test title", description: "test desc", stock: 25, active: true, categories: "category" };
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBe(false)
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ categories: { error: "categories must be a valid array." } })
    })
})

describe("Validating a 2 level depth schema with primitive and non primitive types", () => {
    const baseSchemaModify = { ...baseSchema, origin: { schema: { country: "string", city: "string" } } }
    const validationObject = new ValidationObject(baseSchemaModify);
    const baseTestItem = { title: "test title", description: "test desc", stock: 25, active: true, categories: ["category"], origin: { country: "Argentina", city: "MDP" } }
    afterEach(() => {
        validationObject.errors = {}
    })

    test("input object is a valid schema", () => {
        const obj = JSON.parse(JSON.stringify(baseTestItem));;
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBe(true)
        expect(data).toStrictEqual(baseTestItem)
        expect(errors).toStrictEqual({})
    })

    test("props first level - required by default", () => {
        const { origin, ...obj } = JSON.parse(JSON.stringify(baseTestItem));;
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ origin: { error: "Is required" } })
    })

    test("props second level - required by default", () => {
        const obj = JSON.parse(JSON.stringify(baseTestItem));
        delete obj.origin.city
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ origin: { city: {error: "Is required"} } })
    })


    test("prop number must be a valid number", () => {
        const obj = JSON.parse(JSON.stringify({ ...baseTestItem, stock: "25" }));
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ stock: { error: "stock must be a valid number." } })
    })

    test("prop string must be a valid string", () => {
        const obj = JSON.parse(JSON.stringify({ ...baseTestItem, origin: {...baseTestItem.origin, city: 12} }));
        const { isValidate, errors, data } = validationObject.validate(obj);
        expect(isValidate).toBeFalsy()
        expect(data).toBeNull()
        expect(errors).toStrictEqual({ origin: { city: {error: "city must be a valid string."} } })
    })
})

describe("Validating default values", () => {
    const baseSchemaModify = { ...baseSchema, title: {type: "string", default: "title"}, origin: { schema: { country: {
        type: "string",
        default: "Argentina"
    }, city: "string" } } }
    const validationObject = new ValidationObject(baseSchemaModify);
    const inputTestItem = { description: "test desc", stock: 25, active: true, categories: ["category"], origin: { city: "MDP" } }
    
    afterEach(() => {
        validationObject.errors = {}
    })

    test("if a prop have a default value and does not on input object, then default value appears", () => {
        const obj = JSON.parse(JSON.stringify(inputTestItem));;
        const { isValidate, errors, data } = validationObject.validate(obj);
        const responseTestItem = { title: "title", description: "test desc", stock: 25, active: true, categories: ["category"], origin: { country: "Argentina", city: "MDP" } }
        expect(isValidate).toBe(true)
        expect(data).toStrictEqual(responseTestItem)
        expect(errors).toStrictEqual({})
    })

})

describe("Validating non required values", () => {
    const baseSchemaModify = { ...baseSchema, title: {type: "string", required: false} }
    const validationObject = new ValidationObject(baseSchemaModify);
    const inputTestItem = { description: "test desc", stock: 25, active: true, categories: ["category"] }
    
    beforeEach(() => {
        validationObject.errors = {}
    })

    test("if a prop is a non required field ignore it", () => {
        const obj = JSON.parse(JSON.stringify(inputTestItem));;
        const { isValidate, errors, data } = validationObject.validate(obj);
        const responseTestItem = { description: "test desc", stock: 25, active: true, categories: ["category"] }
        expect(errors).toStrictEqual({})
        expect(data).toStrictEqual(responseTestItem)
        expect(isValidate).toBe(true)
    })
})

describe("Deleting all fields that not match with the schema", () => {
    const baseSchemaModify = { ...baseSchema, title: {type: "string", required: false} }
    const validationObject = new ValidationObject(baseSchemaModify);
    const inputTestItem = { title: "test title", description: "test desc", stock: 25, active: true, categories: ["category"], saraza: "saraza", query: "SELECT *"}
    
    beforeEach(() => {
        validationObject.errors = {}
    })

    test("if a prop is a non required field ignore it", () => {
        const obj = JSON.parse(JSON.stringify(inputTestItem));;
        const { isValidate, errors, data } = validationObject.validate(obj);
        const responseTestItem = { title: "test title", description: "test desc", stock: 25, active: true, categories: ["category"] }
        expect(errors).toStrictEqual({})
        expect(data).toStrictEqual(responseTestItem)
        expect(isValidate).toBe(true)
    })
})