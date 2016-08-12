# easy-schemas
A Node.js Schema package to validate items easily.

## How to use?

### First you need to create an schema:

```js
  let Point = { x: Number, y: Number };
  // it could also be:
  let Point = { x: { type: Number }, y: { type: Number } };
  // or:
  let Point = { x: { type: 'number' }, y: 'number' };
```

### After that you just validate it:

```js
  let p = { x: 2, y: 3 };
  let validation = Point.validate(p);
  if (!validation.valid) { // Invalid validation
    console.log(validation.errors) // Simple list of errors
  }
```

## Schema type options:

  - *type*:      Required. It is the wanted type (an Schema, a class or an String to evaluate)
  - *min*:       Optional. Allows to check the length of arrays and strings, or the value if it's a number or date.
  - *max*:       Optional. Works just the same way as min, but for maximun value.
  - *required*:  Optional. By default, all fields are nulleable (undefined fields are still invalid), use ``required: true`` to avoid that.
  - *pattern*:   Optional. Used to check if a String matches this pattern (it must be a RegExp).
  - *validator*: Optional. A function as the value as argument, if custom or complex validation is needed.
