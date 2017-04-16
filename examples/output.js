(function () {
'use strict';

var babelHelpers = {};
babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

babelHelpers.slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

babelHelpers;


/* istanbul ignore next */
/* istanbul ignore next */

/**
 * const constructorValidate = paramTypes.validate(
 *   'constructor',
 *   paramTypes.string,
 *   paramTypes.number,
 *   paramTypes.restOf(paramTypes.string)
 * );
 */
/**
 * const setNameValidate = paramTypes.validate(
 *   'setName',
 *   paramTypes.string
 * );
 */


function Person(name, age) {
  /* constructorValidate(name, age, ...hobbies); */

  var _name = babelHelpers.slicedToArray(name, 2);

  var firstname = _name[0];
  var lastname = _name[1];

  this.firstname = firstname;
  this.lastname = lastname;
  this.age = age;

  for (var _len = arguments.length, hobbies = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    hobbies[_key - 2] = arguments[_key];
  }

  this.hobbies = hobbies;
}

Person.prototype.setName = function setName(name) {
  /* setNameValidate(name); */

  var _name2 = babelHelpers.slicedToArray(name, 2);

  var firstname = _name2[0];
  var lastname = _name2[1];

  this.firstname = firstname;
  this.lastname = lastname;
};

var laysent = new Person('Shin Lu', 18, 'movie', 'reading', 'programming');

laysent.setName('Something Else');

}());
