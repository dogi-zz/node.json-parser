import {beforeEach, describe, expect, it} from '@jest/globals';
import {TokenTypes} from '../src/json-lexer';
import * as path from "path";
import {createChangeObservable} from "../src/object-proxy";

describe(path.basename(__filename).slice(0, -'.spec.ts'.length), () => {

  beforeEach(async () => {

  });


  it('Simple Objects', async () => {
    const obj1: any = {
      name: 'foo',
    };

    let changes = false;

    const obj1$ = createChangeObservable(obj1, () => changes = true);

    expect(obj1$.name).toEqual('foo');
    expect(obj1$.name2).toEqual(undefined);
    expect(JSON.stringify(obj1$)).toEqual('{"name":"foo"}');
    expect(changes).toEqual(false);

    obj1$.name = 'bar';

    expect(obj1$.name).toEqual('bar');
    expect(obj1$.name2).toEqual(undefined);
    expect(JSON.stringify(obj1$)).toEqual('{"name":"bar"}');
    expect(changes).toEqual(true);
    changes = false;

    obj1$.name2 = 'bar2';

    expect(obj1$.name).toEqual('bar');
    expect(obj1$.name2).toEqual('bar2');
    expect(JSON.stringify(obj1$)).toEqual('{"name":"bar","name2":"bar2"}');
    expect(changes).toEqual(true);
    changes = false;

    obj1$.child = {childValue: 123};

    expect(obj1$.child.childValue).toEqual(123);
    expect(JSON.stringify(obj1$)).toEqual('{"name":"bar","name2":"bar2","child":{"childValue":123}}');
    expect(changes).toEqual(true);
    changes = false;

    obj1$.child.childValue = 234;

    expect(obj1$.child.childValue).toEqual(234);
    expect(JSON.stringify(obj1$)).toEqual('{"name":"bar","name2":"bar2","child":{"childValue":234}}');
    expect(changes).toEqual(true);
    changes = false;

  });

  it('Arrays Objects', async () => {
    const obj1: any[] = ['foo', 'bar'];

    let changes = false;

    const obj1$ = createChangeObservable(obj1, () => changes = true);

    expect(obj1$[0]).toEqual('foo');
    expect(obj1$[1]).toEqual('bar');
    expect(obj1$[2]).toEqual(undefined);
    expect(JSON.stringify(obj1$)).toEqual('["foo","bar"]');
    expect(changes).toEqual(false);

    obj1$.push('test');

    expect(obj1$[0]).toEqual('foo');
    expect(obj1$[1]).toEqual('bar');
    expect(obj1$[2]).toEqual('test');
    expect(JSON.stringify(obj1$)).toEqual('["foo","bar","test"]');
    expect(changes).toEqual(true);
    changes = false;

    obj1$.splice(1, 1);

    expect(obj1$[0]).toEqual('foo');
    expect(obj1$[1]).toEqual('test');
    expect(obj1$[2]).toEqual(undefined);
    expect(JSON.stringify(obj1$)).toEqual('["foo","test"]');
    expect(changes).toEqual(true);
    changes = false;

    obj1$.push({'test1': 123});

    expect(obj1$[0]).toEqual('foo');
    expect(obj1$[1]).toEqual('test');
    expect(obj1$[2]).toEqual({'test1': 123});
    expect(JSON.stringify(obj1$)).toEqual('["foo","test",{"test1":123}]');
    expect(changes).toEqual(true);
    changes = false;

    obj1$[1] =  obj1$[2];

    expect(obj1$[0]).toEqual('foo');
    expect(obj1$[1]).toEqual({'test1': 123});
    expect(obj1$[2]).toEqual({'test1': 123});
    expect(JSON.stringify(obj1$)).toEqual('["foo",{"test1":123},{"test1":123}]');
    expect(changes).toEqual(true);
    changes = false;

    obj1$[2].test2 = 234;

    expect(obj1$[0]).toEqual('foo');
    expect(obj1$[1]).toEqual({'test1': 123, 'test2': 234});
    expect(obj1$[2]).toEqual({'test1': 123, 'test2': 234});
    expect(JSON.stringify(obj1$)).toEqual('["foo",{"test1":123,"test2":234},{"test1":123,"test2":234}]');
    expect(changes).toEqual(true);
    changes = false;


  });


});
