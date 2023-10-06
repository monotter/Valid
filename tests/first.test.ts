import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts'
import { Validate } from '../mod.ts'

Deno.test({
    name: '[Test 1]: 0 level testing',
    fn() {
        assertEquals(Validate(Boolean, true), true)
    }
})
Deno.test({
    name: '[Test 2]: 0 level optional testing',
    fn() {
        assertEquals(Validate({ $schema: Boolean, $optional: true }, undefined), true)
    }
})
Deno.test({
    name: '[Test 3]: 0 level optional testing',
    fn() {
        assertEquals(Validate({ $schema: Boolean, $optional: false }, undefined), false)
    }
})
Deno.test({
    name: '[Test 4]: 0 level optional testing',
    fn() {
        assertEquals(Validate({ $schema: Boolean, $optional: true }, false), true)
    }
})
Deno.test({
    name: '[Test 5]: 0 level optional testing',
    fn() {
        assertEquals(Validate({ $schema: Boolean, $optional: true }, true), true)
    }
})
Deno.test({
    name: '[Test 6]: 0 level optional testing',
    fn() {
        assertEquals(Validate({ $schema: Boolean, $optional: true }, 'sdf'), false)
    }
})
Deno.test({
    name: '[Test 6]: 0 level optional testing',
    fn() {
        assertEquals(Validate(31, 31), true)
    }
})