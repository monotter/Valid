// deno-lint-ignore-file no-explicit-any valid-typeof
import { SchemaType, AsyncSchemaType, AsyncFunctionCheck, FunctionCheck, ClassType, FunctionType, Primitives, ArrayType, ORType, ObjectType, OptionsType } from './Types.ts'
export function Validate<Schema extends SchemaType, Result extends boolean | Promise<boolean> = Schema extends AsyncSchemaType ? Promise<boolean> : boolean>
    (Schema: SchemaType, Value: any, GlobalOptions?: OptionsType, LevelOptions?: OptionsType): Result {
    // Initialize Defaults
    GlobalOptions = GlobalOptions || {}
    LevelOptions = LevelOptions || {}

    if (typeof GlobalOptions.exact === 'undefined') { GlobalOptions.exact = false }
    if (typeof GlobalOptions.match === 'undefined') { GlobalOptions.match = true }
    if (typeof GlobalOptions.optional === 'undefined') { GlobalOptions.optional = false }

    // Configure Options
    const Options = { ...GlobalOptions }
    if (typeof LevelOptions.exact !== 'undefined') { Options.exact = LevelOptions.exact }
    if (typeof LevelOptions.match !== 'undefined') { Options.match = LevelOptions.match }
    if (typeof LevelOptions.optional !== 'undefined') { Options.optional = LevelOptions.optional }

    let ReturnValue: Result | null = null

    // Empty Check
    if (typeof Schema === 'undefined') {
        ReturnValue = (typeof Value === 'undefined') as Result
    } else if (!(typeof Schema === 'object' && typeof (Schema as ObjectType)['$schema'] !== 'undefined') && typeof Value === 'undefined') {
        ReturnValue = Options.optional as Result
    }
    // Regex Check
    else if (Schema instanceof RegExp) {
        if (Options.exact && typeof Value !== 'string') {
            ReturnValue = false as Result
        } else {
            ReturnValue = Schema.test(`${Value}`) as Result
        }
    }
    // Regular Value Check
    else if (['bigint', 'boolean', 'number', 'string', 'symbol'].includes(typeof Schema)) {
        ReturnValue = (Options.exact ? Schema === Value : Schema == Value) as Result
    } else if (typeof Schema === 'function') {
    // Class Check
        if (isClass(Schema)) {
            if (Primitives.includes(Schema as Primitives)) {
                const ValueOf = Schema.valueOf() as { name: 'BigInt' | 'String' | 'Boolean' | 'Number' | 'Symbol' }
                ReturnValue = (typeof Value === ValueOf.name.toLowerCase()) as Result
            }
            else {
                ReturnValue = Value instanceof (Schema as ClassType) as Result
            }
        }
    // Async Checker Check
        else if (Schema.constructor.name === 'AsyncFunction') {
            ReturnValue = new Promise((res) => res((Schema as AsyncFunctionCheck)(Value))) as Result
        }
    // Checker Check
        else {
            ReturnValue = (Schema as FunctionCheck)(Value) as Result
        }
    } else if (typeof Schema === 'object') {
    // Array Check
        if (Array.isArray(Schema)) {
            if (!(typeof Value === 'object' && Array.isArray(Value))) {
                ReturnValue = false as Result
            } else {
                const MaxAmount = (Schema.length >= 3 ? Schema[2] : Schema.length >= 2 ? Schema[1] : Infinity)!
                const MinAmount = (Schema.length >= 3 ? Schema[1] : 0)!
                if (Value.length > MaxAmount || Value.length < MinAmount) {
                    ReturnValue = false as Result
                }
                else {
                    const Results = Value.map((_Value) => Validate((Schema as ArrayType)[0], _Value, GlobalOptions)) as Result[]
                    if (Results.find(_Value => _Value instanceof Promise)) {
                        ReturnValue = new Promise((Resolve) => Promise.all(Results).then((_Results: Result[]) => Resolve(_Results.every(Result => Result)))) as Result
                    } else {
                        ReturnValue = Results.every(Result => Result) as Result
                    }
                }
            }
        } else {
            const SchemaKeys = Object.keys(Schema)
    // Or Check
            if (SchemaKeys.includes('$or')) {
                if (!(typeof (Schema as ORType)['$or'] === 'object' && Array.isArray((Schema as ORType)['$or']))) { throw '$or must be an Array' }
                const Results = (Schema as ORType)['$or'].map((_Schema) => Validate(_Schema, Value, GlobalOptions)) as [Result]
                if (Results.find(_Value => _Value instanceof Promise)) {
                    ReturnValue = new Promise((Resolve) => Promise.all(Results).then((_Results: Result[]) => Resolve(_Results.some(Result => Result)))) as Result
                } else {
                    ReturnValue = Results.some(Result => Result) as Result
                }
            }
    // Extra Schema Check
            else if (SchemaKeys.includes('$schema')) {
                const _LevelOptions: OptionsType = {}
                if (typeof (Schema as ObjectType)['$exact'] !== 'undefined') { _LevelOptions.exact = (Schema as ObjectType)['$exact'] as boolean }
                if (typeof (Schema as ObjectType)['$match'] !== 'undefined') { _LevelOptions.match = (Schema as ObjectType)['$match'] as boolean }
                if (typeof (Schema as ObjectType)['$optional'] !== 'undefined') { _LevelOptions.optional = (Schema as ObjectType)['$optional'] as boolean }
                ReturnValue = Validate((Schema as ObjectType)['$schema'], Value, GlobalOptions, _LevelOptions) as Result
            }
    // Object Check
            else {
                const ValueKeys = Object.keys(Value)
                if (Options.exact && ValueKeys.filter(ValueKey => !SchemaKeys.includes(ValueKey)).length > 0) {
                    ReturnValue = false as Result
                } else {
                    const Results = SchemaKeys.map((SchemaKey) => {
                        const _Schema = (Schema as ObjectType)[SchemaKey]
                        return Validate(_Schema, Value[SchemaKey], GlobalOptions) as Result
                    }) as Result[]
                    if (Results.find(_Value => _Value instanceof Promise)) {
                        ReturnValue = new Promise((Resolve) => Promise.all(Results).then((_Results: Result[]) => Resolve(_Results.every(Result => Result)))) as Result
                    } else {
                        ReturnValue = Results.every(Result => Result) as Result
                    }
                }
            }
        }
    } else {
    // If There Is Nothing Left To Do
        ReturnValue = false as Result
    }
    // Match
    if (Options.match === false) {
        ReturnValue = !ReturnValue as Result
    }
    return ReturnValue
}

// Source: https://stackoverflow.com/a/66120819/10763408
function isClass<T extends ClassType | FunctionType, C = T extends ClassType ? true : false>(func: T): C {
    if (!(func && func.constructor === Function) || func.prototype === undefined)
        return (false as unknown) as C
    if (Function.prototype !== Object.getPrototypeOf(func))
        return (true as unknown) as C
    return (Object.getOwnPropertyNames(func.prototype).length > 1 as unknown) as C
}