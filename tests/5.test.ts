import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts'
import { Validate, SchemaType } from '../mod.ts'
Deno.test({
    name: '[Test 1]: testing',
    fn() {
        assertEquals(Validate({
            query: {
                $or: [
                    { a: 1 },
                    { b: 1 },
                ]
            }
        }, { query: { a: 1 } }), true)
    }
})
Deno.test({
    name: '[Test 2]: testing',
    fn() {
        assertEquals(Validate({
            query: {
                $or: [
                    { a: 1 },
                    { b: 1 },
                ]
            }
        }, { query: { b: 1 } }), true)
    }
})
Deno.test({
    name: '[Test 3]: testing',
    fn() {
        assertEquals(Validate({
            query: {
                $or: [
                    { a: 1 },
                    { b: 1 },
                ]
            }
        }, { query: { a:1, b: 1 } }), true)
    }
})
Deno.test({
    name: '[Test 4]: testing',
    fn() {
        assertEquals(Validate({
            query: {
                $or: [
                    { a: 1 },
                    { b: 1 },
                ]
            }
        }, { query: { a:1, b: 1 } }, { exact: true }), false)
    }
})