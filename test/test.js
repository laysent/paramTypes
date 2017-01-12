import { expect } from 'chai';
import sinon from 'sinon';
import * as paramTypes from '../index';

const testValidator = (input, validator, ifShouldThrow) => (function (a) {
  sinon.stub(console, 'error');
  if (ifShouldThrow) {
    expect(() => paramTypes.validateWithErrors('iife', validator)(a)).to.throw();

    paramTypes.validate('iife', validator)(a);
    expect(console.error.callCount).to.eq(1);
  } else {
    expect(() => paramTypes.validateWithErrors('iife', validator)(a)).to.not.throw();

    paramTypes.validate('iife', validator)(a);
    expect(console.error.callCount).to.eq(0);
  }
  console.error.restore();
}(input));

describe('array:', () => {
  const validator = paramTypes.array.isRequired;
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
  const validator = paramTypes.bool.isRequired;
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
  const validator = paramTypes.func.isRequired;
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
  const validator = paramTypes.number.isRequired;
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
  const validator = paramTypes.object.isRequired;
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
  const validator = paramTypes.string.isRequired;
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
  const validator = paramTypes.symbol.isRequired;
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
  const validator = paramTypes.date.isRequired;
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
  const validator = paramTypes.regexp.isRequired;
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
  const validator = paramTypes.any.isRequired;
  it('should not throw error for any param', () => {
    [0, 1, '', [], { }, new Date(), /a/, () => ({})].forEach((value) => {
      testValidator(value, validator, false);
    });
  });
});

describe('arrayOf:', () => {
  it('should not throw error for an array of given type', () => {
    testValidator([0, 1], paramTypes.arrayOf(paramTypes.number.isRequired).isRequired, false);
  });
  it('should not throw error for empty array', () => {
    testValidator([], paramTypes.arrayOf(paramTypes.number.isRequired).isRequired, false);
  });
  it('should throw error if value is not array', () => {
    testValidator(
      { 0: 1, length: 1 },
      paramTypes.arrayOf(paramTypes.number.isRequired).isRequired,
      true
    );
  });
  it('should throw error if any value is not valid', () => {
    testValidator(
      [1, 0, '1'],
      paramTypes.arrayOf(paramTypes.number.isRequired).isRequired,
      true
    );
  });
});

describe('instanceOf:', () => {
  it('should not throw error if value is instance of type', () => {
    testValidator(new Date(), paramTypes.instanceOf(Date).isRequired, false);
    testValidator(new Date(), paramTypes.instanceOf(Object).isRequired, false);
  });
  it('should throw error if value is not instance of type', () => {
    testValidator(new Date(), paramTypes.instanceOf(RegExp).isRequired, true);
  });
});

describe('objectOf:', () => {
  it('should not throw error if value has property all passed validation', () => {
    const obj = { key: 1, key2: 2, key3: 0 };
    testValidator(obj, paramTypes.objectOf(paramTypes.number).isRequired, false);
  });
  it('should throw error if value is not object', () => {
    [1, 0, '1', '0', []].forEach((value) => {
      testValidator(value, paramTypes.objectOf(paramTypes.any).isRequired, true);
    });
  });
  it('should throw error if value contains property not passing validation', () => {
    const obj = { key: 1, key2: '2', key3: 0 };
    testValidator(obj, paramTypes.objectOf(paramTypes.number).isRequired, true);
  });
});

describe('oneOf:', () => {
  it('should not throw error if value matches any of validation', () => {
    const value = 'two';
    testValidator(value, paramTypes.oneOf(['one', 'two', 'three']).isRequired, false);
  });
  it('should throw error if value does not match any of validation', () => {
    const value = 'four';
    testValidator(value, paramTypes.oneOf(['one', 'two', 'three']).isRequired, true);
  });
  it('should handle NaN correctly', () => {
    const value = NaN;
    testValidator(value, paramTypes.oneOf([undefined, null, NaN]).isRequired, false);
  });
});

describe('oneOfType:', () => {
  it('should not throw error if value matches any of validation', () => {
    const value = new Date();
    testValidator(value, paramTypes.oneOfType([
      paramTypes.number,
      paramTypes.string,
      paramTypes.date,
    ]).isRequired, false);
  });
  it('should throw error if value does not match any of validation', () => {
    const value = /regexp/;
    testValidator(value, paramTypes.oneOfType([
      paramTypes.number,
      paramTypes.string,
      paramTypes.date,
    ]).isRequired, true);
  });
});

describe('shape:', () => {
  it('should not throw error if properties all pass validation', () => {
    const object = { a: 1, b: 'b', c: /c/, d: new Date() };
    testValidator(object, paramTypes.shape({
      a: paramTypes.number,
      b: paramTypes.string,
    }).isRequired, false);
  });
  it('should throw error if one of property does not pass validation', () => {
    const object = { a: 1, b: 'b', c: /c/, d: new Date() };
    testValidator(object, paramTypes.shape({
      a: paramTypes.number,
      c: paramTypes.string,
    }).isRequired, true);
  });
  it('should throw error if value is not object', () => {
    [1, 0, '1', '0', []].forEach((value) => {
      testValidator(value, paramTypes.shape({ }).isRequired, true);
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
    genTest(false, paramTypes.restOf(paramTypes.number.isRequired).isRequired)(1, 2, 3);
  });
  it('should not throw error for empty rest params', () => {
    genTest(
      false,
      paramTypes.string.isRequired,
      paramTypes.restOf(paramTypes.number.isRequired)
    )('1');
  });
  it('should throw error for not match value in rest params', () => {
    genTest(
      true,
      paramTypes.string.isRequired,
      paramTypes.restOf(paramTypes.number.isRequired).isRequired
    )('1', 2, '3');
  });
  it('should throw error if restOf validator is not the last validator', () => {
    genTest(
      true,
      paramTypes.restOf(paramTypes.number.isRequired).isRequired,
      paramTypes.number.isRequired
    )('1');
  });
});

describe('isRequired:', () => {
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

    paramTypes.any,
    paramTypes.arrayOf(paramTypes.any),
    paramTypes.instanceOf(Object),
    paramTypes.objectOf(paramTypes.any),
    paramTypes.oneOf([]),
    paramTypes.oneOfType([paramTypes.any]),
    paramTypes.shape({}),
    paramTypes.restOf(paramTypes.any),
  ];
  it('should throw error if required validator receives null or undefined', () => {
    const requiredValidators = validators.map(v => v.isRequired);
    requiredValidators.forEach((validator) => {
      testValidator(null, validator, true);
      testValidator(undefined, validator, true);
    });
  });
  it('should not throw error if not required validator receives null or undefined', () => {
    validators.forEach((validator) => {
      testValidator(null, validator, false);
      testValidator(undefined, validator, false);
    });
  });
});
