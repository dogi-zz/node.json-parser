

export const createChangeObservable = <T>(obj: T, callback: () => void): T => {
  if ((obj ?? null) === null || typeof obj !== 'object') {
    return obj;
  }
  return new Proxy(obj, {
    get(target, property, receiver) {
      return createChangeObservable(Reflect.get(target, property, receiver), callback);
    },
    set(target, property, value, receiver) {
      const oldValue = target[property];
      const result = Reflect.set(target, property, value, receiver);
      if (oldValue !== value) {
        callback();
      }
      return result;
    },
  });
};


export const createReadonly = <T>(obj: T): T => {
  if ((obj ?? null) === null || typeof obj !== 'object') {
    return obj;
  }
  return new Proxy(obj, {
    get(target, property, receiver) {
      return createReadonly(Reflect.get(target, property, receiver));
    },
    set(target, property, value, receiver) {
      throw new Error('Readonly');
    },
  });
};
