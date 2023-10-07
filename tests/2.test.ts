import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts'
import { Validate, SchemaType } from '../mod.ts'

const schema: SchemaType = { $optional: true, $schema: /2/, $exact: true, $match: true }

Deno.test({
    name: '[Test 1]: testing',
    fn() {
        assertEquals(Validate(schema, 2), false)
    }
})

Deno.test({
    name: '[Test 2]: testing',
    fn() {
        assertEquals(Validate(schema, "2"), true)
    }
})

Deno.test({
    name: '[Test 3]: testing',
    fn() {
        assertEquals(Validate(schema, undefined), true)
    }
})