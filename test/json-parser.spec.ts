import {beforeEach, describe, expect, it} from '@jest/globals';
import {JsonLexer, TokenTypes} from '../src/json-lexer';
import {JsonParser} from '../src/json-parser';
import * as path from "path";

const {OBJ_START, OBJ_END, ARR_START, ARR_END, COMMA, COLON, NULL, BOOLEAN, NUMBER, STRING} = TokenTypes;

describe(path.basename(__filename).slice(0, -'.spec.ts'.length), () => {

  beforeEach(async () => {

  });


  it('Json Lexer - Tokenize JSON', async () => {

    const inputString = `
{   "extraData": "foo",    "name_1": "My Name",    "bool_1": true,    "child_2": {
      "posX": -2
   },
   "workState": "employed",
   "array_3": [       "element 1",       null   ]
}
`;
    const tokens = new JsonLexer().fetchTokens(inputString);

    expect(tokens).toEqual([
        {type: OBJ_START, pos: 1, line: 1, column: 0, length: 1, rawString: '{'},
        {type: STRING, pos: 5, line: 1, column: 4, length: 11, rawString: '"extraData"', stringValue: 'extraData'},
        {type: COLON, pos: 16, line: 1, column: 15, length: 1, rawString: ':'},
        {type: STRING, pos: 18, line: 1, column: 17, length: 5, rawString: '"foo"', stringValue: 'foo'},
        {type: COMMA, pos: 23, line: 1, column: 22, length: 1, rawString: ','},
        {type: STRING, pos: 28, line: 1, column: 27, length: 8, rawString: '"name_1"', stringValue: 'name_1'},
        {type: COLON, pos: 36, line: 1, column: 35, length: 1, rawString: ':'},
        {type: STRING, pos: 38, line: 1, column: 37, length: 9, rawString: '"My Name"', stringValue: 'My Name'},
        {type: COMMA, pos: 47, line: 1, column: 46, length: 1, rawString: ','},
        {type: STRING, pos: 52, line: 1, column: 51, length: 8, rawString: '"bool_1"', stringValue: 'bool_1'},
        {type: COLON, pos: 60, line: 1, column: 59, length: 1, rawString: ':'},
        {type: BOOLEAN, pos: 62, line: 1, column: 61, length: 4, rawString: 'true', booleanValue: true},
        {type: COMMA, pos: 66, line: 1, column: 65, length: 1, rawString: ','},
        {type: STRING, pos: 71, line: 1, column: 70, length: 9, rawString: '"child_2"', stringValue: 'child_2'},
        {type: COLON, pos: 80, line: 1, column: 79, length: 1, rawString: ':'},
        {type: OBJ_START, pos: 82, line: 1, column: 81, length: 1, rawString: '{'},
        {type: STRING, pos: 90, line: 2, column: 6, length: 6, rawString: '"posX"', stringValue: 'posX'},
        {type: COLON, pos: 96, line: 2, column: 12, length: 1, rawString: ':'},
        {type: NUMBER, pos: 98, line: 2, column: 14, length: 2, rawString: '-2', numberValue: -2},
        {type: OBJ_END, pos: 104, line: 3, column: 3, length: 1, rawString: '}'},
        {type: COMMA, pos: 105, line: 3, column: 4, length: 1, rawString: ','},
        {type: STRING, pos: 110, line: 4, column: 3, length: 11, rawString: '"workState"', stringValue: 'workState'},
        {type: COLON, pos: 121, line: 4, column: 14, length: 1, rawString: ':'},
        {type: STRING, pos: 123, line: 4, column: 16, length: 10, rawString: '"employed"', stringValue: 'employed'},
        {type: COMMA, pos: 133, line: 4, column: 26, length: 1, rawString: ','},
        {type: STRING, pos: 138, line: 5, column: 3, length: 9, rawString: '"array_3"', stringValue: 'array_3'},
        {type: COLON, pos: 147, line: 5, column: 12, length: 1, rawString: ':'},
        {type: ARR_START, pos: 149, line: 5, column: 14, length: 1, rawString: '['},
        {type: STRING, pos: 157, line: 5, column: 22, length: 11, rawString: '"element 1"', stringValue: 'element 1'},
        {type: COMMA, pos: 168, line: 5, column: 33, length: 1, rawString: ','},
        {type: NULL, pos: 176, line: 5, column: 41, length: 4, rawString: 'null'},
        {type: ARR_END, pos: 183, line: 5, column: 48, length: 1, rawString: ']'},
        {type: OBJ_END, pos: 185, line: 6, column: 0, length: 1, rawString: '}'},
      ],
    );

  });

  it('Json Parser - Parse JSON', async () => {
    let result: any;
    // const inputString = `{"foo": "bar",
    //   "obj1": [{child1: 2}, {child2: 3}, null, 123],
    // }`;
    // expect(result).toEqual({foo: 'bar', obj1: [{child1: 2}, {child2: 3}, null, 123]});
    //
    result = new JsonParser().parseObject('null');
    expect(result).toEqual(null);

    result = new JsonParser().parseObject('true');
    expect(result).toEqual(true);

    result = new JsonParser().parseObject('false');
    expect(result).toEqual(false);

    result = new JsonParser().parseObject('"FOO\\"BAR"');
    expect(result).toEqual('FOO"BAR');

    result = new JsonParser().parseObject('-123e-1');
    expect(result).toEqual(-12.3);

    expect(() => new JsonParser().parseObject('"FOO')).toThrow();

    expect(() => new JsonParser().parseObject('\'test\'')).toThrow();

    result = new JsonParser({singleQuote: true}).parseObject('\'test\'');
    expect(result).toEqual('test');

    expect(() => new JsonParser({singleQuote: true}).parseObject('test')).toThrow();

    result = new JsonParser({singleQuote: true, textTokens: true}).parseObject('test');
    expect(result).toEqual('test');

    result = new JsonParser({}).parseObject('{}');
    expect(result).toEqual({});

    result = new JsonParser({}).parseObject('{"foo": "bar"}');
    expect(result).toEqual({foo: 'bar'});

    result = new JsonParser({}).parseObject('{"foo": "bar", "num": 123}');
    expect(result).toEqual({foo: 'bar', num: 123});

    result = new JsonParser({}).parseObject('{"foo": "bar", "nums": {"num1":12,"num2":34}}');
    expect(result).toEqual({foo: 'bar', nums: {num1: 12, num2: 34}});

    result = new JsonParser({}).parseObject('{"foo": "bar", "nums": {"num1":12,"num2":34, "extra": {"e": false}}}');
    expect(result).toEqual({foo: 'bar', nums: {num1: 12, num2: 34, extra: {e: false}}});

    result = new JsonParser({singleQuote: true, textTokens: true}).parseObject('{"foo": \'bar\', "nums": {num1:12,num2:34, "extra": {"e": false}}}');
    expect(result).toEqual({foo: 'bar', nums: {num1: 12, num2: 34, extra: {e: false}}});

    expect(() => new JsonParser({singleQuote: true, textTokens: true}).parseObject('{"foo": \'bar\', "num": 123, }')).toThrow();

    result = new JsonParser({singleQuote: true, textTokens: true, extraComma: true}).parseObject('{"foo": \'bar\', "num": 123, }');
    expect(result).toEqual({foo: 'bar', num: 123});

    result = new JsonParser().parseObject('[]');
    expect(result).toEqual([]);

    result = new JsonParser().parseObject('["foo"]');
    expect(result).toEqual(['foo']);

    result = new JsonParser().parseObject('["foo", "bar"]');
    expect(result).toEqual(['foo', 'bar']);

    expect(() => new JsonParser().parseObject('["foo" "bar"]')).toThrow();

    expect(() => new JsonParser().parseObject('["foo", "bar",]')).toThrow();

    result = new JsonParser({textTokens: true, extraComma: true}).parseObject('[foo, bar,]');
    expect(result).toEqual(['foo', 'bar']);

    result = new JsonParser({textTokens: true, extraComma: true}).parseObject('{foo: bar, "nums": [{name: n1, value: [1,2]},{name: n2, value: [2,3]}]}');
    expect(result).toEqual({foo: 'bar', nums: [{name: 'n1', value: [1,2]},{name: 'n2', value: [2,3]}]});

  });


});
