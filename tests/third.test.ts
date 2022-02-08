import { assertEquals } from 'https://deno.land/std@0.125.0/testing/asserts.ts'
import { validate, SchemaType } from '../mod.ts'
const schema: SchemaType = {
    name: String,
    surname: { $type: String, $optional: true },
    zipcode: /^[0-9]{5}(?:-[0-9]{4})?$/, //00000
    zipcode2: { $type: String, $regex: /^[0-9]{5}(?:-[0-9]{4})?$/ }, //00000
    fields: [String],
    fields1: [String, 5],
    fields2: [String, 1, 5],
    fields3: [{
        name: 3
    }],
    test: {
        $type: {
            option: Boolean,
            option2: [Boolean]
        },
        $optional: true
    },
    f: {
        g: {
            b: [{
                v: [{
                    u: String
                }]
            }]
        }
    },
    a: {
        $or: [
            (value) => { console.log(2, value); return true },
            async (value) => { console.log(1, value); return true },
        ]
    },
    c: [[[String]]]
}
Deno.test({
    name: '[Test 1]: testing',
    fn() {
        assertEquals(validate(schema, ['uwu']), false)
    }
})
Deno.test({
    name: '[Test 1]: testing',
    async fn() {
        assertEquals(await validate(schema, {
            name: 'mert',
            surname: 'hh',
            zipcode: '32454',
            zipcode2: '32454',
            fields: ['sdf', 'sdf', 'sdf', 'sdf', 'sdf', 'sdf', 'sdf', 'sdf', 'sdf', 'sdf', 'sdf'],
            fields1: ['sdf', 'sdf', 'sdf', 'sdf', 'sdf'],
            fields2: ['sdf'],
            fields3: [{ name: 3 }, { name: 3 }, { name: 3 }, { name: 3 }, { name: 3 }, { name: 3 }, { name: 3 }],
            f: { g: { b: [{ v: [{ u: 'uwu' }, { u: 'uwu' }, { u: 'uwu' }] }, { v: [{ u: 'uwu' }, { u: 'uwu' }, { u: 'uwu' }] }] } },
            a: 'uwu',
            c: [[['gg','gg'],['gg','gg']],[['gg','gg'],['gg','gg']]],
            test: {
                option: true,
                option2: [true]
            }
        }), true)
    }
})
