// deno-lint-ignore-file no-explicit-any
export type ORType = { $or: SchemaType[] }

export type MatchingType = { $schema: SchemaType, $optional?: boolean, $exact?: boolean, $match?: boolean }
export type SchemaType = ORType | MatchingType | ArrayType | ObjectType | FunctionType | ClassType | string | number | boolean | RegExp
export type AsyncSchemaType = ORType | MatchingType | ArrayType | ObjectType | AsyncFunctionCheck | ClassType | string | number | boolean | RegExp
export type RegularSchemaType = ORType | MatchingType | ArrayType | ObjectType | FunctionCheck | ClassType | string | number | boolean | RegExp

export type ArrayType = [SchemaType] | [SchemaType, number] | [SchemaType, number, number]

export type ObjectType = { [P in Exclude<string, '$schema' | '$optional' | '$or' | '$exact' | '$match'>]: SchemaType }
export type FunctionType = FunctionCheck | AsyncFunctionCheck
export type FunctionCheck = (value: any) => boolean
export type AsyncFunctionCheck = (value: any) => Promise<boolean>
export type ClassType = { new(): any }
export type OptionsType = { optional?: boolean, exact?: boolean, match?: boolean }

export type Primitives = BigIntConstructor | BooleanConstructor | NumberConstructor | StringConstructor | SymbolConstructor
export const Primitives = [BigInt, Boolean, Number, String, Symbol]