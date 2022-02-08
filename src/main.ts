// deno-lint-ignore-file no-explicit-any valid-typeof no-async-promise-executor
export type ORType = { $or: SchemaType[] }
export type MatchingType = { $type: SchemaType, $optional?: boolean, $exact?: boolean, $match?: boolean, $regex?: RegExp }
export type ArrayType = [SchemaType] | [SchemaType, number] | [SchemaType, number, number]
export type ObjectType = { [P in Exclude<string, '$type' | '$optional' | '$regex' | '$match' | '$or' | '$exact'>]: SchemaType }// currently not works, 07.02.2022
export type AsyncFunctionType = ((value: any) => Promise<boolean>)
export type RegularFunctionType = ((value: any) => boolean)
export type FunctionType = AsyncFunctionType | RegularFunctionType
export type ClassType = { new(): any }
export type AsyncSchemaType = ORType | MatchingType | ArrayType | ObjectType | FunctionType | ClassType | string | number | boolean | RegExp
export type RegularSchemaType = ORType | MatchingType | ArrayType | ObjectType | RegularFunctionType | ClassType | string | number | boolean | RegExp
export type SchemaType = RegularSchemaType | AsyncSchemaType
export type primitives = BigIntConstructor | BooleanConstructor | NumberConstructor | StringConstructor | SymbolConstructor
export const primitives = [BigInt, Boolean, Number, String, Symbol]
const _validate = <T extends SchemaType, X extends boolean | Promise<boolean> = T extends RegularSchemaType ? boolean : Promise<boolean>>(schema: T, value: any, defaults?: { optional?: boolean, match?: boolean, exact?: boolean, urv?: boolean }, options?: { optional?: boolean, match?: boolean, exact?: boolean, urv?: boolean }): X => {
    const _defaults = { optional: false, match: true, exact: true, ...(defaults || {}), ...(options || {}) }
    try {
        if (_defaults.optional && typeof value === 'undefined') { return true as X }
        if (['bigint', 'boolean', 'number', 'string', 'symbol', 'undefined'].includes(typeof schema)) { return (_defaults.exact ? schema === value : schema == value) as X }
        if (typeof schema === 'function') {
            if (isClass(schema)) {
                if (primitives.includes(schema as primitives)) {
                    const _valof = schema.valueOf() as { name: string }
                    return (_valof.name.toLowerCase() === typeof value) as X
                }
                return value instanceof (schema as ClassType) as X
            } else {
                if (schema.constructor.name === "AsyncFunction") {
                    return new Promise((res) => res((schema as AsyncFunctionType)(value))) as X
                }
                return (schema as RegularFunctionType)(value) as X
            }
        }
        if (typeof schema === 'object') {
            if (schema === null) { return (_defaults.exact ? value === null : value == null) as X }
            if (schema instanceof RegExp) {
                if (_defaults.exact && typeof value !== 'string') { return false as X }
                return (_defaults.match ? schema.test(`${value}`) : !schema.test(`${value}`)) as X
            }
            if (Array.isArray(schema)) {
                if (typeof value !== 'object') { return false as X }
                if (!Array.isArray(value)) { return false as X }
                const max = (schema.length >= 3 ? schema[2] : schema.length >= 2 ? schema[1] : Infinity)!
                const min = (schema.length >= 3 ? schema[1] : 0)!
                if (value.length > max || value.length < min) { return false as X }
                const vals = value.map((val) => _validate((schema as ArrayType)[0], val, defaults))
                if (vals.find(a => a instanceof Promise)) {
                    return new Promise(async (res) => res((await Promise.all(vals)).every(a => a))) as X
                }
                return vals.every(a => a) as X
            } else {
                const keys = Object.keys(schema)
                if (keys.includes('$or')) {
                    const _schema = schema as ORType
                    if (typeof _schema['$or'] === 'object' && Array.isArray(_schema['$or'])) {
                        const vals = _schema['$or'].map((__schema) => _validate(__schema, value, defaults))
                        if (vals.find(a => a instanceof Promise)) {
                            return new Promise(async (res) => res((await Promise.all(vals)).some(a => a))) as X
                        }
                        return vals.some(a => a) as X
                    } else {
                        throw '$or must be an Array'
                    }
                }
                if (['$type', '$regex', '$optional', '$match', '$exact'].some(a => keys.includes(a))) {
                    const _schema = schema as MatchingType
                    const __defaults = _defaults || {}
                    const _options = {
                        optional: _schema['$optional'] || __defaults.optional,
                        match: _schema['$match'] || __defaults.match,
                        exact: _schema['$exact'] || __defaults.exact,
                    }
                    if ((keys.includes('$type') && _schema['$type'] instanceof RegExp) || keys.includes('$regex')) {
                        if (keys.includes('$type') && _schema['$type'] instanceof RegExp) {
                            const _type = _schema['$type'] as RegExp
                            if (_options.exact && typeof value !== 'string') { return false as X }
                            return (_options.match ? _type.test(`${value}`) : !_type.test(`${value}`)) as X
                        }
                        if (keys.includes('$regex')) {
                            const _type = keys.includes('$type') ? _schema.$type as ClassType : String
                            if (_options.exact && primitives.includes(_schema.$type as primitives) && (_schema.$type.valueOf() as { name: string }).name.toLowerCase() !== typeof value) { return false as X }
                            const _regex = _schema['$regex'] as RegExp
                            return (_options.match ? _regex.test(`${value}`) : !_regex.test(`${value}`)) as X
                        }
                    }
                    if (keys.includes('$type')) {
                        const ___defaults = defaults || {}
                        const __options = {
                            optional: _schema['$optional'] || ___defaults.optional,
                            match: _schema['$match'] || ___defaults.match,
                            exact: _schema['$exact'] || ___defaults.exact,
                        }
                        return _validate(_schema['$type'], value, defaults, __options) as X
                    }
                    return (typeof _defaults.urv === 'undefined' ? false : _defaults.urv) as X
                }
                const valueKeys = Object.keys(value)
                const _schema = schema as ObjectType
                if (_defaults.exact && valueKeys.filter(a=>!keys.includes(a)).length > 0) { return false as X }
                const vals = keys.map((key) => {
                    const __schema = _schema[key]
                    return _validate(__schema, value[key], defaults)
                })
                if (vals.find(a => a instanceof Promise)) {
                    return new Promise(async (res) => res((await Promise.all(vals)).every(a => a))) as X
                }
                return vals.every(a => a) as X
            }
        }
        return (typeof _defaults.urv === 'undefined' ? false : _defaults.urv) as X
    } catch (error) {
        if (typeof _defaults.urv !== 'undefined') {
            return _defaults.urv as X
        } else {
            throw error
        }
    }
}
export const validate = (schema: SchemaType, value: any, defaults?: { optional?: boolean, match?: boolean, exact?: boolean, urv?: boolean }): Promise<boolean> => {
    let _options = {}
    if (typeof schema === 'object' && !Array.isArray(schema) && !(schema instanceof RegExp) && Object.keys(schema).includes('$type')) {
        const _schema = schema as MatchingType
        const __defaults = defaults || {}
        _options = {
            optional: _schema['$optional'] || __defaults.optional,
            match: _schema['$match'] || __defaults.match,
            exact: _schema['$exact'] || __defaults.exact,
        }
    }
    return _validate(schema, value, defaults, _options)
}
// Source: https://bobbyhadz.com/blog/javascript-check-if-two-arrays-have-same-elements
function areEqual(array1: string[], array2: string[]) {
    if (array1.length === array2.length) {
        return array1.every(element => {
            if (array2.includes(element)) {
                return true
            }
            return false
        })
    }
    return false
}
// Source: https://stackoverflow.com/a/66120819/10763408
function isClass<T extends ClassType | FunctionType, C = T extends ClassType ? true : false>(func: T): C {
    if (!(func && func.constructor === Function) || func.prototype === undefined)
        return (false as unknown) as C
    if (Function.prototype !== Object.getPrototypeOf(func))
        return (true as unknown) as C
    return (Object.getOwnPropertyNames(func.prototype).length > 1 as unknown) as C
}