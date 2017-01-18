import * as paramTypes from '../index';

const constructorValidate = paramTypes.validate(
  'constructor',
  paramTypes.string.isRequired,
  paramTypes.number.isRequired,
  paramTypes.restOf(paramTypes.string.isRequired)
);

const setNameValidate = paramTypes.validate(
  'setName',
  paramTypes.string.isRequired
);

class Person {
  constructor(name, age, ...hobbies) {
    constructorValidate(name, age, ...hobbies);

    const [firstname, lastname] = name;
    this.firstname = firstname;
    this.lastname = lastname;
    this.age = age;
    this.hobbies = hobbies;
  }

  setName(name) {
    setNameValidate(name);

    const [firstname, lastname] = name;
    this.firstname = firstname;
    this.lastname = lastname;
  }
}

const laysent = new Person('Shin Lu', 18, 'movie', 'reading', 'programming');

laysent.setName('Something Else');
