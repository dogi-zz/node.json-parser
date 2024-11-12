export abstract class ObjectCheckerOption {

  protected constructor() {

  }

  public check(value: any, verbose?: boolean): boolean {
    return false;
  }

}


export class ObjectChecker {

  private options: ObjectCheckerOption[];

  public constructor(...options: ObjectCheckerOption[]) {
    this.options = options;
  }

  public check(value: any, verbose?: boolean) {
    if (verbose) {
      console.info(this, 'checking value', value, '...');
    }
    if (this.options.some(o => o.check(value, verbose))) {
      return true;
    }
    console.info(this, 'error in value', value, '!');
    return false;
  }

}


export class ObjectCheckerDynamic extends ObjectCheckerOption {

  public constructor(private callback: (value: any) => boolean) {
    super();
  }

  public override check(value: any, verbose?: boolean): boolean {
    return this.callback(value);
  }

}


export type ObjectCheckerObjectOption = string | ObjectCheckerOption | ObjectCheckerOption[]

export class ObjectCheckerObject extends ObjectCheckerOption {

  public constructor(private options: { [property: string]: ObjectCheckerObjectOption }) {
    super();
  }

  public override check(value: any, verbose?: boolean): boolean {
    if (verbose) {
      console.info(this, 'checking value', value, '...');
    }
    if (!value || Array.isArray(value) || typeof value !== 'object') {
      return false;
    }
    for (const [key, checker] of Object.entries(this.options)) {
      if (verbose) {
        console.info(this, 'checking key', key, '...');
      }
      if (!this.checkOption(value[key], checker, verbose)) {
        if (verbose) {
          console.info(this, 'checking key', key, '...');
        }
        return false;
      }
    }
    return true;
  }

  private checkOption(value: any, option: ObjectCheckerObjectOption, verbose: boolean): boolean {
    if (typeof option === 'string') {
      return typeof value === option;
    }
    if (Array.isArray(option)) {
      return option.some(o => o.check(value, verbose));
    }
    return option.check(value, verbose);
  }
}


export class ObjectCheckerArray extends ObjectCheckerOption {

  private options: ObjectCheckerOption[];

  public constructor(...options: ObjectCheckerOption[]) {
    super();
    this.options = options;
  }

  public override check(value: any, verbose?: boolean): boolean {
    if (verbose) {
      console.info(this, 'checking value', value, '...');
    }
    if (!value || !Array.isArray(value)) {
      return false;
    }
    if (this.options.length) {
      for (const item of value) {
        if (verbose) {
          console.info(this, 'checking item', item, '...');
        }
        if (this.options.every(o => !o.check(item, verbose))) {
          if (verbose) {
            console.info(this, 'error item', item, '!');
          }
          return false;
        }
      }
    }
    return true;
  }

}


export const ObjectCheckerNull = new ObjectCheckerDynamic(value => value === null);
export const ObjectCheckerUndefined = new ObjectCheckerDynamic(value => value === undefined);
export const ObjectCheckerEmpty = new ObjectCheckerDynamic(value => value === null || value === undefined);
export const ObjectCheckerAny = new ObjectCheckerDynamic(() => true);
