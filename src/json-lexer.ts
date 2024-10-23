export const TokenTypes: { [key: string]: TokenType } = {
  OBJ_START: 'obj_start',
  OBJ_END: 'obj_end',
  ARR_START: 'arr_start',
  ARR_END: 'arr_end',
  COMMA: 'comma',
  COLON: 'colon',
  NULL: 'null',
  BOOLEAN: 'boolean',
  NUMBER: 'number',
  STRING: 'string',
};

export type TokenType =
  'obj_start' |
  'obj_end' |
  'arr_start' |
  'arr_end' |
  'comma' |
  'colon' |
  'null' |
  'boolean' |
  'number' |
  'string';

const {OBJ_START, OBJ_END, ARR_START, ARR_END, COMMA, COLON, NULL, BOOLEAN, NUMBER, STRING} = TokenTypes;


export type JsonLexerToken = {
  type: TokenType,
  pos: number;
  line: number;
  column: number;
  length: number;
  rawString: string,
  stringValue?: string,
  booleanValue?: boolean,
  numberValue?: boolean,
};

export class JsonLexerError extends Error {
  public constructor(message: string, public position: number, public line: number, public column: number) {
    super(`${message} at ${position} [${line}:${column}]`);
  }
}

export type LexerOptions = {
  singleQuote?: boolean;
  textTokens?: boolean;
};

const TextTokenRegex = /[a-zA-Z0-9_]/;

export class JsonLexer {

  protected lexerOptions: LexerOptions;

  private inputString: string;
  private lexerPosition: number;
  private lexerline: number;
  private lexerColumn: number;

  private fetchTokenResult: JsonLexerToken[];

  public constructor(lexerOptions?: LexerOptions) {
    this.lexerOptions = lexerOptions;
  }

  public parse(jsonString: string) {
    this.inputString = jsonString;
    this.lexerPosition = 0;
    this.lexerline = 0;
    this.lexerColumn = 0;
    while (this.lexerPosition < this.inputString.length) {
      try {
        this.parseToken();
      } catch (e) {
        this.onJsonLexerError(e, this.lexerPosition, this.lexerline, this.lexerColumn);
        break;
      }
    }
  }

  public fetchTokens(inputString: string): JsonLexerToken[] {
    this.fetchTokenResult = [];
    this.parse(inputString);
    return this.fetchTokenResult;
  }

  private startsWith(str: string | string[]) {
    if (typeof str === 'string') {
      if (this.lexerPosition + str.length > this.inputString.length) {
        return false;
      }
      for (let i = 0; i < str.length; i++) {
        if (this.inputString[this.lexerPosition + i] !== str[i]) {
          return false;
        }
      }
      return true;
    } else {
      return str.some(s => this.startsWith(s));
    }
  }

  private parseToken() {
    if (this.startsWith('\r\n')) {
      this.lexerPosition += 2;
      this.lexerline += 1;
      this.lexerColumn = 0;
      return;
    }
    if (this.startsWith('\n') || this.startsWith('\r')) {
      this.lexerPosition += 1;
      this.lexerline += 1;
      this.lexerColumn = 0;
      return;
    }
    if (this.startsWith('\t') || this.startsWith(' ')) {
      this.lexerPosition += 1;
      this.lexerColumn += 1;
      return;
    }


    if (this.startsWith('null')) {
      return this.onSimpleToken(NULL, 'null');
    }
    if (this.startsWith('true')) {
      return this.onSimpleToken(BOOLEAN, 'true', 'booleanValue', true);
    }
    if (this.startsWith('false')) {
      return this.onSimpleToken(BOOLEAN, 'false', 'booleanValue', false);
    }

    const simpleTokenList: [string, TokenType][] = [
      [',', COMMA],
      [':', COLON],
      ['{', OBJ_START],
      ['}', OBJ_END],
      ['[', ARR_START],
      [']', ARR_END],
    ];
    const simpleToken = simpleTokenList.find(([t]) => {
      return this.startsWith(t);
    });
    if (simpleToken) {
      return this.onSimpleToken(simpleToken[1], simpleToken[0]);

    }

    if (this.startsWith('"')) {
      return this.parseString();
    }
    if (this.startsWith('\'') && this.lexerOptions?.singleQuote) {
      return this.parseString();
    }

    if (this.startsWith(['+', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])) {
      return this.parseNumber();
    }

    if (this.lexerOptions?.textTokens) {
      if (this.inputString[this.lexerPosition].match(TextTokenRegex)) {
        return this.parseTextToken();
      }
    }

    throw new Error(`Parse Error at Position ${this.lexerPosition} [${this.lexerline}:${this.lexerColumn}] ${JSON.stringify(this.inputString[this.lexerPosition])}`);
  }

  private onSimpleToken(type: TokenType, rawString: string, valueKey?: keyof JsonLexerToken, value?: any) {
    const pos = this.lexerPosition;
    const line = this.lexerline;
    const column = this.lexerColumn;
    const length = rawString.length;
    const token: JsonLexerToken = {type, pos, line, column, length, rawString};
    if (valueKey) {
      (token as any)[valueKey] = value;
    }
    this.onJsonLexerToken(token);
    this.lexerPosition += rawString.length;
    this.lexerColumn += rawString.length;
  }


  private onSimpleFromEnd(type: TokenType, length: number, valueKey?: keyof JsonLexerToken, parseString?: string) {
    const pos = this.lexerPosition - length;
    const line = this.lexerline;
    const column = this.lexerColumn;
    const rawString = this.inputString.substring(pos, this.lexerPosition);
    const token: JsonLexerToken = {type, pos, line, column, length, rawString};
    if (valueKey) {
      (token as any)[valueKey] = parseString || JSON.parse(rawString);
    }
    this.onJsonLexerToken(token);
    this.lexerColumn += rawString.length;
  }


  private parseString() {
    const quoteStart = this.inputString[this.lexerPosition++];
    let length = 1;
    const startPos = this.lexerPosition;
    do {
      if (this.startsWith('\\')) {
        this.lexerPosition += 1;
        length += 1;
      }
      this.lexerPosition += 1;
      length += 1;
      if (this.startsWith(['\n', '\r'])) {
        throw new Error(`Unterminated String on position ${this.lexerPosition - length} [${this.lexerline}:${this.lexerColumn}]`);
      }
    } while (!this.startsWith(quoteStart) && this.lexerPosition < this.inputString.length) ;
    const endPos = this.lexerPosition;
    this.lexerPosition += 1;
    length += 1;
    if (this.lexerPosition > this.inputString.length) {
      throw new Error(`Unterminated String on position ${this.lexerPosition - length} [${this.lexerline}:${this.lexerColumn}]`);
    }
    const parseString = JSON.parse(`"${this.inputString.substring(startPos, endPos)}"`);
    this.onSimpleFromEnd(STRING, length, 'stringValue', parseString);
  }

  private parseTextToken() {
    let length = 0;
    const startPos = this.lexerPosition;
    do {
      this.lexerPosition += 1;
      length += 1;
      if (this.startsWith(['\n', '\r'])) {
        break;
      }
    } while (this.lexerPosition < this.inputString.length && this.inputString[this.lexerPosition].match(TextTokenRegex)) ;
    const endPos = this.lexerPosition;
    const parseString = this.inputString.substring(startPos, endPos);
    this.onSimpleFromEnd(STRING, length, 'stringValue', parseString);
  }

  private parseNumber() {
    let length = 0;
    let hadComma = false;
    let hadE = false;
    do {
      if (this.startsWith('.')) {
        hadComma = true;
      }
      if (this.startsWith(['e', 'E'])) {
        hadE = true;
        length += 1;
        this.lexerPosition += 1;
        if (this.startsWith('-')) {
          length += 1;
          this.lexerPosition += 1;
        }
        continue;
      }
      length += 1;
      this.lexerPosition += 1;
    } while (this.startsWith(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) || (!hadComma && this.startsWith('.')) || (!hadE && this.startsWith(['e', 'E'])));
    this.onSimpleFromEnd(NUMBER, length, 'numberValue');
  }

  protected onJsonLexerToken(token: JsonLexerToken) {
    if (this.fetchTokenResult) {
      this.fetchTokenResult.push(token);
    }
  }

  protected onJsonLexerError(message: string | Error, position: number, line: number, column: number) {
    if (message instanceof Error) {
      const result = new JsonLexerError(message.message, position, line, column);
      result.stack = message.stack;
      throw result;
    } else {
      throw new JsonLexerError(message, position, line, column);
    }
  }

}
