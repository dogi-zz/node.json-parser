import {JsonLexer, JsonLexerToken, LexerOptions, TokenTypes} from './json-lexer';

const {OBJ_START, OBJ_END, ARR_START, ARR_END, COMMA, COLON, NULL, BOOLEAN, NUMBER, STRING} = TokenTypes;

type ParseState = { type: 'finished' }
  | { type: 'object', token: JsonLexerToken, key: string, state: 'none' | 'hasKey' | 'hasColon' | 'hasValue' | 'next', value: any }
  | { type: 'array',  token: JsonLexerToken, state: 'none' | 'hasValue' | 'next', value: any };

const endObjectOrArrayPossible = (state: ParseState, parserOptions: ParserOptions) => {
  if (state.type === 'finished') {
    return false;
  }
  if (state.state === 'none' || state.state === 'hasValue') {
    return true;
  }
  if (parserOptions?.extraComma && state.state === 'next') {
    return true;
  }
  return false;
};

const addValuePossible = (state: ParseState, parserOptions: ParserOptions) => {
  if (state.type === 'object' && state.state === 'hasColon') {
    return true;
  }
  if (state.type === 'array' && (state.state === 'none' || state.state === 'next')) {
    return true;
  }
  return false;
};


export type ParserOptions = LexerOptions & {
  extraComma?: boolean;
};


export class JsonParser extends JsonLexer {

  private result: any;
  private resultStack: ParseState[];

  private parserOptions: ParserOptions;

  public constructor(parserOptions?: ParserOptions) {
    super(parserOptions);
    this.parserOptions = parserOptions;
  }

  public override parse(jsonString: string) {
    this.result = null;
    this.resultStack = [];
    super.parse(jsonString);
  }

  public parseObject(jsonString: string, onError?: (e: string) => any): any {
    try {
      this.parse(jsonString);
    } catch (e) {
      if (onError) {
        return onError(e.message);
      } else {
        throw e;
      }
    }
    if (this.resultStack.length !== 1) {
      throw new Error(`Unexpected end of string`);
    }
    if (this.resultStack[0].type !== 'finished') {
      const stackElement = this.resultStack[0];
      const token = stackElement.type === 'object' || stackElement.type === 'array' ? stackElement.token : null;
      throw new Error(`Unclosed ${stackElement.type} at Position ${token.pos} [${token.line}:${token.column}]`);
    }
    return this.result;
  }

  protected jsonParserGetPrimitive(token: JsonLexerToken): { value: any } {
    if (token.type === NULL) {
      return {value: null};
    } else if (token.type === BOOLEAN) {
      return {value: token.booleanValue};
    } else if (token.type === STRING) {
      return {value: token.stringValue};
    } else if (token.type === NUMBER) {
      return {value: token.numberValue};
    }
    return null;
  }

  protected jsonParserPerformResult(value: any, token: JsonLexerToken) {
    if (this.resultStack.length === 0) {
      this.result = value;
      this.resultStack.unshift({type: 'finished'});
    } else if (this.resultStack[0].type === 'object' && addValuePossible(this.resultStack[0], this.parserOptions)) {
      this.resultStack[0].value[this.resultStack[0].key] = value;
      this.resultStack[0].key = null;
      this.resultStack[0].state = 'hasValue';
    } else if (this.resultStack[0].type === 'array' && addValuePossible(this.resultStack[0], this.parserOptions)) {
      this.resultStack[0].value.push(value);
      this.resultStack[0].state = 'hasValue';
    } else {
      throw new Error(`Unexpected token type ${token.type} at Position ${token.pos} [${token.line}:${token.column}]`);
    }
  }

  protected jsonParserParseValue(token: JsonLexerToken) {
    const primitive = this.jsonParserGetPrimitive(token);
    if (primitive) {
      this.jsonParserPerformResult(primitive.value, token);
      return;
    }
    if (token.type === OBJ_START) {
      this.resultStack.unshift({type: 'object', token, key: null, state: 'none', value: {}});
      return;
    }
    if (token.type === ARR_START) {
      this.resultStack.unshift({type: 'array', token, state: 'none', value: []});
      return;
    }
    throw new Error(`Unexpected token type ${token.type} at Position ${token.pos} [${token.line}:${token.column}]`);
  }

  protected override onJsonLexerToken(token: JsonLexerToken) {
    super.onJsonLexerToken(token);

    if (this.resultStack.length === 0) {
      this.jsonParserParseValue(token);
      return;
    }

    if (this.resultStack[0].type === 'object') {
      if (token.type === OBJ_END) {
        if (endObjectOrArrayPossible(this.resultStack[0], this.parserOptions)) {
          const value = this.resultStack[0].value;
          this.resultStack.shift();
          this.jsonParserPerformResult(value, token);
          return;
        }
      } else if (this.resultStack[0].state === 'none' || this.resultStack[0].state === 'next') {
        if (token.type === STRING) {
          this.resultStack[0].key = token.stringValue;
          this.resultStack[0].state = 'hasKey';
          return;
        }
      } else if (this.resultStack[0].state === 'hasKey') {
        if (token.type === COLON) {
          this.resultStack[0].state = 'hasColon';
          return;
        }
      } else if (this.resultStack[0].state === 'hasColon') {
        this.jsonParserParseValue(token);
        return;
      } else if (this.resultStack[0].state === 'hasValue') {
        if (token.type === COMMA) {
          this.resultStack[0].state = 'next';
          return;
        }
      }
    }

    if (this.resultStack[0].type === 'array') {
      if (token.type === ARR_END) {
        if (endObjectOrArrayPossible(this.resultStack[0], this.parserOptions)) {
          const value = this.resultStack[0].value;
          this.resultStack.shift();
          this.jsonParserPerformResult(value, token);
          return;
        }
      } else if (this.resultStack[0].state === 'none' || this.resultStack[0].state === 'next') {
        this.jsonParserParseValue(token);
        return;
      } else if (this.resultStack[0].state === 'hasValue') {
        if (token.type === COMMA) {
          this.resultStack[0].state = 'next';
          return;
        }
      }
    }

    throw new Error(`JsonParser: Unexpected token type ${token.type} at Position ${token.pos} [${token.line}:${token.column}]`);
  }

}

