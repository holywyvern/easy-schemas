import getType from 'type-detect';
import extend  from 'extend';

import Errors  from './errors';


function validate(obj, validator, errors = [], field = null) {
  for (let key of Object.keys(validator)) {
    let value = validator[key];
    let newField = field ? `${field}.${key}` : key;
    if (typeof obj[key] == 'undefined') {
      errors.push({ type: Errors.UNDEFINED_FIELD, field: newField  });
      continue;
    }
    validateField(obj[key], value, errors, newField);
  }
  return errors;
}

function validateField(obj, validator, errors, field) {
  switch (getType(validator)) {
    case 'string':
      validateString(obj, validator, errors, field);
      break;
    case 'function':
      validateFunction(obj, validator, errors, field);
      break;
    case 'array':
      validateArray(obj, validator, errors, field);
    case 'object':
      validateObject(obj, validator, errors, field);
      break;
    case 'schema':
      validate(obj, validator._validator, errors, field);
      break;
    default:
      throw `Unknown validator for field '${field}'`;
  }

}


function validateString(obj, validator, errors, field) {
  if (obj === null) return;
  let given = getType(obj);
  if (given !== validator) {
    errors.push({ type: Errors.NOT_OF_TYPE, field, given, expected: validator })
  }
}

function validateFunction(obj, validator, errors, field) {
  if (obj === null) return;
  switch (validator) {
    case Boolean:
      validateString(obj, 'boolean', errors, field);
      break;  
    case Number:
      validateString(obj, 'number', errors, field);
      break;      
    case String:
      validateString(obj, 'string', errors, field);
      break;        
    case Array:
      validateString(obj, 'array', errors, field);
      break;    
    case Function:
      validateString(obj, 'function', errors, field);
      break;    
    case Symbol:
      validateString(obj, 'symbol', errors, field);
      break;    
    case Date:
      validateString(obj, 'date', errors, field);
      break;
    default:
      if (typeof validator[Symbol.toStringTag] != 'undefined') {
        validateString(obj, validator[Symbol.toStringTag], errors, field);
        break;
      } else if (!(obj instanceof validator)) {
        errors.push({ type: Errors.NOT_AN_INSTANCE_OF, field, class: validator });
      }
      break;
  }

}

function validateArray(obj, validator, errors, field) {
  if (obj === null) return;
  let given = getType(obj);
  if (given == 'array') {
    obj.forEach((value, index) => validateField(value, validator[0], errors, `${field}[${index}]`));
  } else {
    errors.push({ type: Errors.NOT_OF_TYPE, field, given, expected: 'array' })
  }
}

function numericComparator(obj) {
  switch (getType(obj)) {
    case 'string': case 'array': return obj.length;
    case 'date':                 return obj.getTime();
    default:                     return obj;
  }
}

function validateObject(obj, validator, errors, field) {
  if (typeof validator.type != 'undefined') {
    validateField(obj, validator.type, errors, field);
  }
  if ((typeof validator.required !== 'undefined') && validator.required && (obj === null)) {
    errors.push({ type: Errors.REQUIRED, field });
  }
  if (obj !== null) {
    if ((typeof validator.min == 'number') && (numericComparator(obj) < numericComparator(validator.min))) {
      errors.push({ type: Errors.BELOW_MIN, field, min: validator.min });
    }
    if ((typeof validator.max == 'number') && (numericComparator(obj) > numericComparator(validator.max))) {
      errors.push({ type: Errors.OVER_MAX, field, max: validator.max });
    }
    if ((typeof validator.validator == 'function') && (!validator.validator(obj))) {
      errors.push({ type: Errors.VALIDATOR_FAILED, field });
    }
    if ((typeof validator.pattern !== 'undefined') && !validator.pattern.test(obj)) {
      errors.push({ type: Errors.INVALID_PATTERN, field });
    }
  }
}


class Schema {

  constructor(validator) {
    this._validator = validator;
  }

  validate(obj) {
    let errors = validate(obj, this._validator);
    return { valid: errors.length == 0, errors };
  }

  [Symbol.toStringTag]() {
    return 'schema';
  }

  add(validator) {
    this._validator = extend(false, this._validator, validator);
  }

}

Schema.Errors = Errors;

export default Schema;