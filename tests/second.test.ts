import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts'
import { validate, SchemaType } from '../mod.ts'

Deno.test({
    name: '[Test 1]: testing',
    fn() {
        assertEquals(validate([Array], ['uwu']), false)
    }
})
Deno.test({
    name: '[Test 2]: testing',
    fn() {
        assertEquals(validate([Array], [[],[],[]]), true)
    }
})
Deno.test({
    name: '[Test 3]: testing',
    fn() {
        assertEquals(validate([Array, 0, 0], [[]]), false)
    }
})
Deno.test({
    name: '[Test 4]: testing',
    fn() {
        assertEquals(validate([Array,0,4], [[],[],[],[]]), true)
    }
})

Deno.test({
    name: '[Test 5]: testing',
    fn() {
        assertEquals(validate([Array,0,4], [[],[],[],[],[]]), false)
    }
})