'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeDetect = require('type-detect');

var _typeDetect2 = _interopRequireDefault(_typeDetect);

var _extend = require('extend');

var _extend2 = _interopRequireDefault(_extend);

var _errors = require('./errors');

var _errors2 = _interopRequireDefault(_errors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _validate(obj, validator) {
  var errors = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
  var field = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = Object.keys(validator)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var value = validator[key];
      var newField = field ? field + '.' + key : key;
      if (typeof obj[key] == 'undefined') {
        errors.push({ type: _errors2.default.UNDEFINED_FIELD, field: newField });
        continue;
      }
      validateField(obj[key], value, errors, newField);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return errors;
}

function validateField(obj, validator, errors, field) {
  switch ((0, _typeDetect2.default)(validator)) {
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
      _validate(obj, validator._validator, errors, field);
      break;
    default:
      throw 'Unknown validator for field \'' + field + '\'';
  }
}

function validateString(obj, validator, errors, field) {
  if (obj === null) return;
  var given = (0, _typeDetect2.default)(obj);
  if (given !== validator) {
    errors.push({ type: _errors2.default.NOT_OF_TYPE, field: field, given: given, expected: validator });
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
        errors.push({ type: _errors2.default.NOT_AN_INSTANCE_OF, field: field, class: validator });
      }
      break;
  }
}

function validateArray(obj, validator, errors, field) {
  if (obj === null) return;
  var given = (0, _typeDetect2.default)(obj);
  if (given == 'array') {
    obj.forEach(function (value, index) {
      return validateField(value, validator[0], errors, field + '[' + index + ']');
    });
  } else {
    errors.push({ type: _errors2.default.NOT_OF_TYPE, field: field, given: given, expected: 'array' });
  }
}

function numericComparator(obj) {
  switch ((0, _typeDetect2.default)(obj)) {
    case 'string':case 'array':
      return obj.length;
    case 'date':
      return obj.getTime();
    default:
      return obj;
  }
}

function validateObject(obj, validator, errors, field) {
  if (typeof validator.type != 'undefined') {
    validateField(obj, validator.type, errors, field);
  }
  if (typeof validator.required !== 'undefined' && validator.required && obj === null) {
    errors.push({ type: _errors2.default.REQUIRED, field: field });
  }
  if (obj !== null) {
    if (typeof validator.min == 'number' && numericComparator(obj) < numericComparator(validator.min)) {
      errors.push({ type: _errors2.default.BELOW_MIN, field: field, min: validator.min });
    }
    if (typeof validator.max == 'number' && numericComparator(obj) > numericComparator(validator.max)) {
      errors.push({ type: _errors2.default.OVER_MAX, field: field, max: validator.max });
    }
    if (typeof validator.validator == 'function' && !validator.validator(obj)) {
      errors.push({ type: _errors2.default.VALIDATOR_FAILED, field: field });
    }
    if (typeof validator.pattern !== 'undefined' && !validator.pattern.test(obj)) {
      errors.push({ type: _errors2.default.INVALID_PATTERN, field: field });
    }
  }
}

var Schema = function () {
  function Schema(validator) {
    _classCallCheck(this, Schema);

    this._validator = validator;
  }

  _createClass(Schema, [{
    key: 'validate',
    value: function validate(obj) {
      var errors = _validate(obj, this._validator);
      return { valid: errors.length == 0, errors: errors };
    }
  }, {
    key: Symbol.toStringTag,
    value: function value() {
      return 'schema';
    }
  }, {
    key: 'add',
    value: function add(validator) {
      this._validator = (0, _extend2.default)(false, this._validator, validator);
    }
  }]);

  return Schema;
}();

Schema.Errors = _errors2.default;

exports.default = Schema;
//# sourceMappingURL=index.js.map
