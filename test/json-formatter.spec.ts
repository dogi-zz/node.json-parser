import {beforeEach, describe, expect, it} from '@jest/globals';
import {TokenTypes} from '../src/json-lexer';
import * as path from 'path';
import {JsonFormatter, NEW_LINE, WHITE_SPACE} from "../src/json-formatter";
import {KEY} from "../src/json-parser";

const {OBJ_START, OBJ_END, ARR_START, ARR_END, COMMA, COLON, NULL, BOOLEAN, NUMBER, STRING} = TokenTypes;

describe(path.basename(__filename).slice(0, -'.ts'.length), () => {

  beforeEach(async () => {

  });


  it('Json Formatter - format json', async () => {

    const inputString = `
{   "extraData": "foo", name_1: "My Name",    bool_1: true,    'child_2': {
      "posX": -2
   },
   "workState": "employed",
   "array_3": [       "element 1",       null   ]
}
`;
    const formatter = new JsonFormatter({singleQuote: true, textTokens: true});
    const result = formatter.fetchFormatedTokens(inputString);

    expect(formatter.getJsonString(result)).toEqual(`{
  "extraData": "foo",
  "name_1": "My Name",
  "bool_1": true,
  "child_2": {
    "posX": -2
  },
  "workState": "employed",
  "array_3": [
    "element 1",
    null
  ]
}`);

    expect(result).toEqual([
        {type: OBJ_START, pos: [0, 0], token: {type: OBJ_START, pos: 1, line: 1, column: 0, length: 1, rawString: '{'}, rawString: '{'},
        {type: NEW_LINE, pos: [0, 1], rawString: '\n'},

        {type: WHITE_SPACE, pos: [1, 0], rawString: '  '},
        {type: KEY, pos: [1, 2], token: {type: STRING, pos: 5, line: 1, column: 4, length: 11, rawString: '"extraData"', stringValue: 'extraData'}, rawString: '"extraData"'},
        {type: COLON, pos: [1, 13], token: {type: COLON, pos: 16, line: 1, column: 15, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [1, 14], rawString: ' '},
        {type: STRING, pos: [1, 15], token: {type: STRING, pos: 18, line: 1, column: 17, length: 5, rawString: '"foo"', stringValue: 'foo'}, rawString: '"foo"'},
        {type: COMMA, pos: [1, 20], token: {type: COMMA, pos: 23, line: 1, column: 22, length: 1, rawString: ','}, rawString: ','},
        {type: NEW_LINE, pos: [1, 21], rawString: '\n'},

        {type: WHITE_SPACE, pos: [2, 0], rawString: '  '},
        {type: KEY, pos: [2, 2], token: {type: STRING, pos: 25, line: 1, column: 24, length: 6, rawString: 'name_1', stringValue: 'name_1'}, rawString: '"name_1"'},
        {type: COLON, pos: [2, 10], token: {type: COLON, pos: 31, line: 1, column: 30, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [2, 11], rawString: ' '},
        {type: STRING, pos: [2, 12], token: {type: STRING, pos: 33, line: 1, column: 32, length: 9, rawString: '"My Name"', stringValue: 'My Name'}, rawString: '"My Name"'},
        {type: COMMA, pos: [2, 21], token: {type: COMMA, pos: 42, line: 1, column: 41, length: 1, rawString: ','}, rawString: ','},
        {type: NEW_LINE, pos: [2, 22], rawString: '\n'},

        {type: WHITE_SPACE, pos: [3, 0], rawString: '  '},
        {type: KEY, pos: [3, 2], token: {type: STRING, pos: 47, line: 1, column: 46, length: 6, rawString: 'bool_1', stringValue: 'bool_1'}, rawString: '"bool_1"'},
        {type: COLON, pos: [3, 10], token: {type: COLON, pos: 53, line: 1, column: 52, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [3, 11], rawString: ' '},
        {type: BOOLEAN, pos: [3, 12], token: {type: BOOLEAN, pos: 55, line: 1, column: 54, length: 4, rawString: 'true', booleanValue: true}, rawString: 'true'},
        {type: COMMA, pos: [3, 16], token: {type: COMMA, pos: 59, line: 1, column: 58, length: 1, rawString: ','}, rawString: ','},
        {type: NEW_LINE, pos: [3, 17], rawString: '\n'},

        {type: WHITE_SPACE, pos: [4, 0], rawString: '  '},
        {type: KEY, pos: [4, 2], token: {type: STRING, pos: 64, line: 1, column: 63, length: 9, rawString: '\'child_2\'', stringValue: 'child_2'}, rawString: '"child_2"'},
        {type: COLON, pos: [4, 11], token: {type: COLON, pos: 73, line: 1, column: 72, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [4, 12], rawString: ' '},
        {type: OBJ_START, pos: [4, 13], token: {type: OBJ_START, pos: 75, line: 1, column: 74, length: 1, rawString: '{'}, rawString: '{'},
        {type: NEW_LINE, pos: [4, 14], rawString: '\n'},

        {type: WHITE_SPACE, pos: [5, 0], rawString: '    '},
        {type: KEY, pos: [5, 4], token: {type: STRING, pos: 83, line: 2, column: 6, length: 6, rawString: '"posX"', stringValue: 'posX'}, rawString: '"posX"'},
        {type: COLON, pos: [5, 10], token: {type: COLON, pos: 89, line: 2, column: 12, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [5, 11], rawString: ' '},
        {type: NUMBER, pos: [5, 12], token: {type: NUMBER, pos: 91, line: 2, column: 14, length: 2, rawString: '-2', numberValue: -2}, rawString: '-2'},
        {type: NEW_LINE, pos: [5, 14], rawString: '\n'},

        {type: WHITE_SPACE, pos: [6, 0], rawString: '  '},
        {type: OBJ_END, pos: [6, 2], token: {type: OBJ_END, pos: 97, line: 3, column: 3, length: 1, rawString: '}'}, rawString: '}'},
        {type: COMMA, pos: [6, 3], token: {type: COMMA, pos: 98, line: 3, column: 4, length: 1, rawString: ','}, rawString: ','},
        {type: NEW_LINE, pos: [6, 4], rawString: '\n'},

        {type: WHITE_SPACE, pos: [7, 0], rawString: '  '},
        {type: KEY, pos: [7, 2], token: {type: STRING, pos: 103, line: 4, column: 3, length: 11, rawString: '"workState"', stringValue: 'workState'}, rawString: '"workState"'},
        {type: COLON, pos: [7, 13], token: {type: COLON, pos: 114, line: 4, column: 14, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [7, 14], rawString: ' '},
        {type: STRING, pos: [7, 15], token: {type: STRING, pos: 116, line: 4, column: 16, length: 10, rawString: '"employed"', stringValue: 'employed'}, rawString: '"employed"'},
        {type: COMMA, pos: [7, 25], token: {type: COMMA, pos: 126, line: 4, column: 26, length: 1, rawString: ','}, rawString: ','},
        {type: NEW_LINE, pos: [7, 26], rawString: '\n'},

        {type: WHITE_SPACE, pos: [8, 0], rawString: '  '},
        {type: KEY, pos: [8, 2], token: {type: STRING, pos: 131, line: 5, column: 3, length: 9, rawString: '"array_3"', stringValue: 'array_3'}, rawString: '"array_3"'},
        {type: COLON, pos: [8, 11], token: {type: COLON, pos: 140, line: 5, column: 12, length: 1, rawString: ':'}, rawString: ':'},
        {type: WHITE_SPACE, pos: [8, 12], rawString: ' '},
        {type: ARR_START, pos: [8, 13], token: {type: ARR_START, pos: 142, line: 5, column: 14, length: 1, rawString: '['}, rawString: '['},
        {type: NEW_LINE, pos: [8, 14], rawString: '\n'},

        {type: WHITE_SPACE, pos: [9, 0], rawString: '    '},
        {type: STRING, pos: [9, 4], token: {type: STRING, pos: 150, line: 5, column: 22, length: 11, rawString: '"element 1"', stringValue: 'element 1'}, rawString: '"element 1"'},
        {type: COMMA, pos: [9, 15], token: {type: COMMA, pos: 161, line: 5, column: 33, length: 1, rawString: ','}, rawString: ','},
        {type: NEW_LINE, pos: [9, 16], rawString: '\n'},

        {type: WHITE_SPACE, pos: [10, 0], rawString: '    '},
        {type: NULL, pos: [10, 4], token: {type: NULL, pos: 169, line: 5, column: 41, length: 4, rawString: 'null'}, rawString: 'null'},
        {type: NEW_LINE, pos: [10, 8], rawString: '\n'},

        {type: WHITE_SPACE, pos: [11, 0], rawString: '  '},
        {type: ARR_END, pos: [11, 2], token: {type: ARR_END, pos: 176, line: 5, column: 48, length: 1, rawString: ']'}, rawString: ']'},
        {type: NEW_LINE, pos: [11, 3], rawString: '\n'},

        {type: OBJ_END, pos: [12, 0], token: {type: OBJ_END, pos: 178, line: 6, column: 0, length: 1, rawString: '}'}, rawString: '}'},
      ],
    );

  });


});
