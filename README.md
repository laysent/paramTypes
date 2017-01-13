## Motivation

Since JavaScript is a dynamic programming language with weak type system built-in, it requires much
more cautious when writing and using APIs. Library such as [React](https://github.com/facebook/react)
provides a way to force property validation using `propTypes`.

With the similar ideas, **paramTypes** will do the same trick to enhance function calls in
development mode. While in production mode, the validation will be removed so that the performance
won't be affected.

## How to use

**paramTypes.validate** is the core API to call. It's a high order function that requires two steps
to setup. First configure, then validate.

Here is an example:

```JavaScript
import * as paramTypes from 'paramTypes';

// define
const validator = paramTypes.validate(
  'function name', // this will be used in error message to help locate the issue
  paramTypes.number.isRequired,
  paramTypes.restOf(paramTypes.string.isRequired),
);

function example(num, ...names) {
  validator(num, ...names);
  // do something
}

example(1, 'Anna', 'Bob', 'Claire');

```

**paramTypes** provides similar validators as `propTypes` in React.

Also, it provides two mode of validation.

+ Use **paramTypes.validate** to validate parameters and output warning in console only

  The actual workflow won't be affected in this way.

+ Use **paramTypes.validateWithError** to validate parameters and throw the first error occurs.

  The actual workflow will be interrupted in this way.

## Production Mode

Do not forget to remove validation in production mode.

To do this, all you need to do is set `process.env.NODE_ENV` to `"production"`.
