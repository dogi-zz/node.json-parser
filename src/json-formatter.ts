import {JsonLexerToken, TokenType, TokenTypes} from './json-lexer';
import {JsonParser, ParserOptions} from './json-parser';

const {OBJ_START, OBJ_END, ARR_START, ARR_END, COMMA, COLON, NULL, BOOLEAN, NUMBER, STRING} = TokenTypes;

export const NEW_LINE = 'new-line';
export const WHITE_SPACE = 'white';

export type JsonFormatterToken = {
  type: TokenType | 'new-line' | 'white',
  token?: JsonLexerToken;
  pos: [number, number]
  rawString: string,
};


export class JsonFormatter extends JsonParser {

  private fetchFormatterTokenResult: JsonFormatterToken[];
  private actualIndent = '';
  private formatLine = 0;
  private formatColumn = 0;


  public constructor(parserOptions?: ParserOptions) {
    super(parserOptions);
  }

  public override parse(jsonString: string) {
    super.parse(jsonString);
  }

  public fetchFormatedTokens(inputString: string): JsonFormatterToken[] {
    this.fetchFormatterTokenResult = [];
    this.parse(inputString);
    return this.fetchFormatterTokenResult;
  }

  private jsonFormatterNewLine(newIndent: string) {
    this.onJsonFormatterToken({
      type: NEW_LINE,
      pos: [this.formatLine, this.formatColumn],
      rawString: `\n`,
    });
    this.formatLine += 1;
    this.actualIndent = newIndent;
    if (this.actualIndent.length) {
      this.onJsonFormatterToken({
        type: WHITE_SPACE,
        pos: [this.formatLine, 0],
        rawString: `${this.actualIndent}`,
      });
    }
    this.formatColumn = this.actualIndent.length;
  }

  protected override onJsonLexerToken(token: JsonLexerToken) {
    super.onJsonLexerToken(token);

    if (token.type === OBJ_END || token.type === ARR_END) {
      this.jsonFormatterNewLine(this.actualIndent.slice(0, -2));
    }
    {
      let rawString = token.rawString;
      if (token.type === STRING) {
        rawString = JSON.stringify(token.stringValue);
      }
      this.onJsonFormatterToken({
        type: token.type,
        token,
        pos: [this.formatLine, this.formatColumn],
        rawString,
      });
      this.formatColumn += rawString.length;
    }
    if (token.type === OBJ_START || token.type === ARR_START) {
      this.jsonFormatterNewLine(this.actualIndent + '  ');
    } else if (token.type === COMMA) {
      this.jsonFormatterNewLine(this.actualIndent);
    } else if (token.type === COLON) {
      this.onJsonFormatterToken({
        type: WHITE_SPACE,
        pos: [this.formatLine, this.formatColumn],
        rawString: ' ',
      });
      this.formatColumn += 1;
    }
  }

  protected onJsonFormatterToken(token: JsonFormatterToken) {
    if (this.fetchFormatterTokenResult) {
      this.fetchFormatterTokenResult.push(token);
    }
  }

  public getJsonString(formatterResult: JsonFormatterToken[]) {
    return formatterResult.map(token => token.rawString).join('');
  }

}
