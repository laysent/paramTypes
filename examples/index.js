import * as paramTypes from '../index';

const constructorValidate = paramTypes.validate(
  'constructor',
  paramTypes.string,
  paramTypes.number,
  paramTypes.restOf(paramTypes.string)
);

const setNameValidate = paramTypes.validate(
  'setName',
  paramTypes.string
);

function Person(name, age, ...hobbies) {
  constructorValidate(name, age, ...hobbies);

  const [firstname, lastname] = name;
  this.firstname = firstname;
  this.lastname = lastname;
  this.age = age;
  this.hobbies = hobbies;
}

Person.prototype.setName = function setName(name) {
  setNameValidate(name);

  const [firstname, lastname] = name;
  this.firstname = firstname;
  this.lastname = lastname;
};

const laysent = new Person('Shin Lu', 18, 'movie', 'reading', 'programming');

laysent.setName('Something Else');
