import { expect } from 'chai';
import sinon from 'sinon';
import * as paramTypes from '../index';

const testValidator = (input, validator, ifShouldThrow, shouldSkipNullable) => (function (a) {
  sinon.stub(console, 'error');
  const nullable = paramTypes.nullable(validator);
  if (ifShouldThrow) {
    expect(() => paramTypes.validateWithErrors('iife', validator)(a)).to.throw();
    if (!shouldSkipNullable) {
      expect(() => paramTypes.validateWithErrors('iife', nullable)(a)).to.throw();
    }

    paramTypes.validate('iife', validator)(a);
    expect(console.error.callCount).to.eq(1);
    if (!shouldSkipNullable) {
      paramTypes.validate('iife', nullable)(a);
      expect(console.error.callCount).to.eq(2);
    }
  } else {
    expect(() => paramTypes.validateWithErrors('iife', validator)(a)).to.not.throw();
    if (!shouldSkipNullable) {
      expect(() => paramTypes.validateWithErrors('iife', nullable)(a)).to.not.throw();
    }

    paramTypes.validate('iife', validator)(a);
    if (!shouldSkipNullable) {
      paramTypes.validate('iife', nullable)(a);
    }
    expect(console.error.callCount).to.eq(0);
  }
  console.error.restore();
}(input));

describe('array:', () => {
  const validator = paramTypes.array;
  it('should not throw error when param is empty array', () => {
    testValidator([], validator, false);
  });
  it('should not throw error when param is non-empty array', () => {
    testValidator([1, 2, 3], validator, false);
  });
  it('should throw error when param is not array', () => {
    [0, 1, '', { length: 0 }, () => ({})].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('bool:', () => {
  const validator = paramTypes.bool;
  it('should not throw error when param is bool', () => {
    testValidator(true, validator, false);
    testValidator(false, validator, false);
  });
  it('should throw error when param is not bool', () => {
    [0, 1, '', { length: 0 }, [], () => ({})].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('func:', () => {
  const validator = paramTypes.func;
  it('should not throw error when param is function', () => {
    testValidator(function () { }, validator, false); // eslint-disable-line
    testValidator(() => ({ }), validator, false);
  });
  it('should throw error when param is not function', () => {
    [0, 1, '', { length: 0 }, []].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('number:', () => {
  const validator = paramTypes.number;
  it('should not throw error when param is number', () => {
    testValidator(1, validator, false);
    testValidator(0, validator, false);
    testValidator(-1, validator, false);
  });
  it('should not throw error when param is number', () => {
    testValidator(1.5, validator, false);
    testValidator(-1.5, validator, false);
  });
  it('should throw error when param is not number', () => {
    ['0', '1', '', { length: 0 }, []].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('object:', () => {
  const validator = paramTypes.object;
  it('should not throw error when param is object', () => {
    testValidator({ }, validator, false);
    testValidator({ key: 'value' }, validator, false);
  });
  it('should throw error when param is not object', () => {
    ['0', '1', '', []].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('string:', () => {
  const validator = paramTypes.string;
  it('should not throw error when param is string', () => {
    testValidator('', validator, false);
    testValidator('something', validator, false);
  });
  it('should throw error when param is not string', () => {
    [0, 1, { length: 0 }, []].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('symbol:', () => {
  const validator = paramTypes.symbol;
  it('should not throw error when param is symbol', () => {
    testValidator(Symbol('something'), validator, false);
  });
  it('should throw error when param is not symbol', () => {
    [0, 1, { length: 0 }, []].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('date:', () => {
  const validator = paramTypes.date;
  it('should not throw error when param is date', () => {
    testValidator(new Date(), validator, false);
  });
  it('should throw error when param is not date', () => {
    [0, 1, '', { length: 0 }, [new Date()], () => ({})].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('regexp:', () => {
  const validator = paramTypes.regexp;
  it('should not throw error when param is regexp', () => {
    testValidator(/a/, validator, false);
  });
  it('should not throw error when param is from new Regexp', () => {
    testValidator(new RegExp('a'), validator, false);
  });
  it('should throw error when param is not regexp', () => {
    [0, 1, '', { length: 0 }, [/a/], () => ({})].forEach((value) => {
      testValidator(value, validator, true);
    });
  });
});

describe('any:', () => {
  const validator = paramTypes.any;
  it('should not throw error for any param', () => {
    [0, 1, '', [], { }, new Date(), /a/, () => ({}), null, undefined].forEach((value) => {
      testValidator(value, validator, false, true);
    });
  });
});

describe('arrayOf:', () => {
  it('should not throw error for an array of given type', () => {
    testValidator([0, 1], paramTypes.arrayOf(paramTypes.number), false);
  });
  it('should not throw error for empty array', () => {
    testValidator([], paramTypes.arrayOf(paramTypes.number), false);
  });
  it('should throw error if value is not array', () => {
    testValidator(
      { 0: 1, length: 1 },
      paramTypes.arrayOf(paramTypes.number),
      true
    );
  });
  it('should throw error if any value is not valid', () => {
    testValidator(
      [1, 0, '1'],
      paramTypes.arrayOf(paramTypes.number),
      true
    );
  });
});

describe('instanceOf:', () => {
  it('should not throw error if value is instance of type', () => {
    testValidator(new Date(), paramTypes.instanceOf(Date), false);
    testValidator(new Date(), paramTypes.instanceOf(Object), false);
  });
  it('should throw error if value is not instance of type', () => {
    testValidator(new Date(), paramTypes.instanceOf(RegExp), true);
  });
});

describe('objectOf:', () => {
  it('should not throw error if value has property all passed validation', () => {
    const obj = { key: 1, key2: 2, key3: 0 };
    testValidator(obj, paramTypes.objectOf(paramTypes.number), false);
  });
  it('should throw error if value is not object', () => {
    [1, 0, '1', '0', []].forEach((value) => {
      testValidator(value, paramTypes.objectOf(paramTypes.any), true);
    });
  });
  it('should throw error if value contains property not passing validation', () => {
    const obj = { key: 1, key2: '2', key3: 0 };
    testValidator(obj, paramTypes.objectOf(paramTypes.number), true);
  });
});

describe('oneOf:', () => {
  it('should not throw error if value matches any of validation', () => {
    const value = 'two';
    testValidator(value, paramTypes.oneOf(['one', 'two', 'three']), false);
  });
  it('should throw error if value does not match any of validation', () => {
    const value = 'four';
    testValidator(value, paramTypes.oneOf(['one', 'two', 'three']), true);
  });
  it('should handle NaN correctly', () => {
    const value = NaN;
    testValidator(value, paramTypes.oneOf([undefined, null, NaN]), false);
  });
});

describe('oneOfType:', () => {
  it('should not throw error if value matches any of validation', () => {
    const value = new Date();
    testValidator(value, paramTypes.oneOfType([
      paramTypes.number,
      paramTypes.string,
      paramTypes.date,
    ]), false);
  });
  it('should throw error if value does not match any of validation', () => {
    const value = /regexp/;
    testValidator(value, paramTypes.oneOfType([
      paramTypes.number,
      paramTypes.string,
      paramTypes.date,
    ]), true);
  });
});

describe('shape:', () => {
  it('should not throw error if properties all pass validation', () => {
    const object = { a: 1, b: 'b', c: /c/, d: new Date() };
    testValidator(object, paramTypes.shape({
      a: paramTypes.number,
      b: paramTypes.string,
    }), false);
  });
  it('should throw error if one of property does not pass validation', () => {
    const object = { a: 1, b: 'b', c: /c/, d: new Date() };
    testValidator(object, paramTypes.shape({
      a: paramTypes.number,
      c: paramTypes.string,
    }), true);
  });
  it('should throw error if value is not object', () => {
    [1, 0, '1', '0', []].forEach((value) => {
      testValidator(value, paramTypes.shape({ }), true);
    });
  });
});

describe('restOf:', () => {
  const genTest = (ifThrow, ...validates) => (...params) => (function (...p) {
    if (ifThrow) {
      expect(() => paramTypes.validateWithErrors('iife', ...validates)(...p)).to.throw();
    } else {
      expect(() => paramTypes.validateWithErrors('iife', ...validates)(...p)).to.not.throw();
    }
  }(...params));
  it('should not throw error for rest of given type values', () => {
    genTest(false, paramTypes.restOf(paramTypes.number))(1, 2, 3);
  });
  it('should not throw error for empty rest params', () => {
    genTest(
      false,
      paramTypes.string,
      paramTypes.restOf(paramTypes.number)
    )('1');
  });
  it('should throw error for not match value in rest params', () => {
    genTest(
      true,
      paramTypes.string,
      paramTypes.restOf(paramTypes.number)
    )('1', 2, '3');
  });
  it('should throw error if restOf validator is not the last validator', () => {
    genTest(
      true,
      paramTypes.restOf(paramTypes.number),
      paramTypes.number
    )('1');
  });
});

describe('nullable:', () => {
  const validators = [
    paramTypes.array,
    paramTypes.bool,
    paramTypes.func,
    paramTypes.number,
    paramTypes.object,
    paramTypes.string,
    paramTypes.symbol,
    paramTypes.date,
    paramTypes.regexp,

    paramTypes.required,
    paramTypes.arrayOf(paramTypes.any),
    paramTypes.instanceOf(Object),
    paramTypes.objectOf(paramTypes.any),
    paramTypes.oneOf([]),
    paramTypes.oneOfType([paramTypes.any]),
    paramTypes.shape({}),
    paramTypes.restOf(paramTypes.any),
  ];
  it('should not throw error if nullable validator receives null or undefined', () => {
    const nullableValidators = validators.map(v => paramTypes.nullable(v));
    nullableValidators.forEach((validator) => {
      testValidator(null, validator, false);
      testValidator(undefined, validator, false);
    });
  });
  it('should throw error if validator receives null or undefined', () => {
    validators.forEach((validator) => {
      testValidator(null, validator, true, true);
      testValidator(undefined, validator, true, true);
    });
  });
});
