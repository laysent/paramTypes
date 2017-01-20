const isRestOfAttribute = '@@paramTypes/isRestOf';
/* istanbul ignore next */ function isSymbol(type, value) {
  if (type === 'symbol') return true;
  if (value['@@toStringTag'] === 'Symbol') return true;
  if (typeof Symbol === 'function' && value instanceof Symbol) return true;
  return false;
}

function getValueType(value) {
  if (Array.isArray(value)) return 'array';
  if (value instanceof RegExp) return 'regexp';
  if (value instanceof Date) return 'date';
  const type = typeof value;
  if (isSymbol(type, value)) return 'symbol';
  return type;
}

function requiredWrapper(validator) {
  return function wrapper(value, methodName, location) {
    if (value == null) {
      return new Error(`Required ${location} parameter was not specified in ${methodName}.`);
    }
    return validator(value, methodName, location);
  };
}

function nullableChecker(validator) {
  return function wrapper(value, methodName, location) {
    if (value == null) return null;
    return validator(value, methodName, location);
  };
}

function createPrimitiveTypeChecker(expectedType) {
  function validate(value, methodName, location) {
    const valueType = getValueType(value);
    if (valueType !== expectedType) {
      return new Error([
        `Invalid ${location} parameter of type ${valueType} supplied to ${methodName}, `,
        `expected ${expectedType}`,
      ].join(''));
    }
    return null;
  }
  return requiredWrapper(validate);
}

function createArrayOfTypeChecker(typeChecker) {
  function validate(value, methodName, location) {
    if (!Array.isArray(value)) {
      const type = getValueType(value);
      return new Error([
        `Invalid ${location} parameter of type ${type} supplied to ${methodName}, `,
        'expected an array.',
      ].join(''));
    }
    for (let i = 0; i < value.length; i += 1) {
      const error = typeChecker(value[i], methodName, `${i}-th element of ${location}`);
      if (error instanceof Error) return error;
    }
    return null;
  }
  return requiredWrapper(validate);
}

function createRestOfTypeChecker(typeChecker) {
  function validate(value, methodName, location) {
    return typeChecker(value, methodName, location);
  }
  const chainableValidate = requiredWrapper(validate);
  chainableValidate[isRestOfAttribute] = true;
  return chainableValidate;
}

function createInstanceTypeChecker(expectedClass) {
  function validate(value, methodName, location) {
    if (!(value instanceof expectedClass)) {
      return new Error([
        `Invalid ${location} parameter supplied to ${methodName}, `,
        `expected instanceof ${expectedClass}`,
      ].join(''));
    }
    return null;
  }
  return requiredWrapper(validate);
}

function createObjectOfTypeChecker(typeChecker) {
  function validate(value, methodName, location) {
    const type = getValueType(value);
    if (type !== 'object') {
      return new Error([
        `Invalid ${location} parameter of type ${type} supplied to ${methodName}, `,
        'expected an object.',
      ].join(''));
    }
    for (const key in value) { // eslint-disable-line
      if (value.hasOwnProperty(key)) {
        const error = typeChecker(value[key], methodName, `property ${key} of ${location}`);
        if (error instanceof Error) {
          return error;
        }
      }
    }
    return null;
  }
  return requiredWrapper(validate);
}

function createEnumTypeChecker(expectedValues) {
  function validate(value, methodName, location) {
    for (let i = 0; i < expectedValues.length; i += 1) {
      if (value === expectedValues[i]) return null;
      if (Number.isNaN(value) && Number.isNaN(expectedValues[i])) return null;
    }
    const valueString = JSON.stringify(expectedValues);
    return new Error([
      `Invalid ${location} parameter of value ${value} supplied to ${methodName}, `,
      `expected to be one of ${valueString}.`,
    ].join(''));
  }
  return requiredWrapper(validate);
}

function createUnionTypeChecker(arrayOfTypeCheckers) {
  function validate(value, methodName, location) {
    for (let i = 0; i < arrayOfTypeCheckers.length; i += 1) {
      const checker = arrayOfTypeCheckers[i];
      if (checker(value, methodName, location) === null) return null;
    }
    return new Error(
      `Invalid ${location} parameter of value ${value} supplied to ${methodName}, `
    );
  }
  return requiredWrapper(validate);
}

function createShapeTypeChecker(shapeTypes) {
  function validate(value, methodName, location) {
    const type = getValueType(value);
    if (type !== 'object') {
      return new Error([
        `Invalid ${location} parameter of type ${type} supplied to ${methodName}, `,
        'expected an object.',
      ].join(''));
    }
    for (const key in shapeTypes) { // eslint-disable-line
      const checker = shapeTypes[key];
      /* istanbul ignore next */if (!value.hasOwnProperty(key)) continue;
      const error = checker(value[key], methodName, `property ${key} of ${location}`);
      if (error) return error;
    }
    return null;
  }
  return requiredWrapper(validate);
}

const validator = ifShouldThrow => (methodName, ...schemas) => {
  for (let i = 0; i < schemas.length - 1; i += 1) {
    if (schemas[i][isRestOfAttribute]) {
      throw new Error(`.restOf should be the last parameter, but found at position ${i}.`);
    }
  }
  return (...values) => {
    schemas.forEach((paramValidator, i) => {
      if (i === schemas.length - 1 && paramValidator[isRestOfAttribute]) {
        for (let j = i; j < values.length; j += 1) {
          const error = paramValidator(values[j], methodName, `${j}-th`);
          if (error) {
            if (ifShouldThrow) throw error;
            console.error(error.message);
          }
        }
        return;
      }
      const error = paramValidator(values[i], methodName, `${i}-th`);
      if (!error) return;
      if (ifShouldThrow) throw error;
      console.error(error.message);
    });
  };
};

export const array = createPrimitiveTypeChecker('array');
export const bool = createPrimitiveTypeChecker('boolean');
export const func = createPrimitiveTypeChecker('function');
export const number = createPrimitiveTypeChecker('number');
export const object = createPrimitiveTypeChecker('object');
export const string = createPrimitiveTypeChecker('string');
export const symbol = createPrimitiveTypeChecker('symbol');
export const date = createPrimitiveTypeChecker('date');
export const regexp = createPrimitiveTypeChecker('regexp');

export const any = () => null;
export const required = requiredWrapper(any);
export const arrayOf = createArrayOfTypeChecker;
export const instanceOf = createInstanceTypeChecker;
export const objectOf = createObjectOfTypeChecker;
export const oneOf = createEnumTypeChecker;
export const oneOfType = createUnionTypeChecker;
export const shape = createShapeTypeChecker;
export const restOf = createRestOfTypeChecker;
export const nullable = nullableChecker;

/* istanbul ignore next */ export const validate =
  process.env.NODE_ENV === 'production' ? () => () => { } : validator(false);
/* istanbul ignore next */ export const validateWithErrors =
  process.env.NODE_ENV === 'production' ? () => () => { } : validator(true);
