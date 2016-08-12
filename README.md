# easy-schemas
A Node.js Schema package to validate items easily.

## How to use?

### First you need to create an schema:

``js
  let Point = { x: Number, y: Number };
  // it could also be:
  let Point = { x: { type: Number }, y: { type: Number } };
  // or:
  let Point = { x: { type: 'number' }, y: 'number' };
``

## After that you just validate it:

``js
  let p = { x: 2, y: 3 };
  let validation = Point.validate(p);
  if (!validation.valid) { // Invalid validation
    console.log(validation.errors) // Simple list of errors
  }
``