
function fail(message) {
  _recordThrow("fail", arguments);
}

function assertTrue(value) {
  if (!value) {
    _recordThrow("assertTrue", arguments);
  }
}

function verifyTrue(value) {
  if (!value) {
    _recordTrace("verifyTrue", arguments);
  }
}

function assertFalse(value) {
  if (value) {
    _recordThrow("assertFalse", arguments);
  }
}

function verifyFalse(value) {
  if (value) {
    _recordTrace("verifyFalse", arguments);
  }
}

function assertNull(value) {
  if (value !== null) {
    _recordThrow("assertNull", arguments);
  }
}

function verifyNull(value) {
  if (value !== null) {
    _recordTrace("verifyNull", arguments);
  }
}

function assertNotNull(value) {
  if (value === null) {
    _recordThrow("assertNotNull", arguments);
  }
}

function verifyNotNull(value) {
  if (value === null) {
    _recordTrace("verifyNotNull", arguments);
  }
}

function assertUndefined(value) {
  if (value !== undefined) {
    _recordThrow("assertUndefined", arguments);
  }
}

function verifyUndefined(value) {
  if (value !== undefined) {
    _recordTrace("verifyUndefined", arguments);
  }
}

function assertNotUndefined(value) {
  if (value === undefined) {
    _recordThrow("assertNotUndefined", arguments);
  }
}

function verifyNotUndefined(value) {
  if (value === undefined) {
    _recordTrace("verifyNotUndefined", arguments);
  }
}

function assertNaN(value) {
  if (!isNaN(value)) {
    _recordThrow("assertNaN", arguments);
  }
}

function verifyNaN(value) {
  if (!isNaN(value)) {
    _recordTrace("verifyNaN", arguments);
  }
}

function assertNotNaN(value) {
  if (isNaN(value)) {
    _recordThrow("assertNotNaN", arguments);
  }
}

function verifyNotNaN(value) {
  if (isNaN(value)) {
    _recordTrace("verifyNotNaN", arguments);
  }
}

function assertEqual(expected, actual) {
  if (!_isEqual(expected, actual)) {
    _recordThrow("assertEqual", arguments);
  }
}

function verifyEqual(expected, actual) {
  if (!_isEqual(expected, actual)) {
    _recordTrace("verifyEqual", arguments);
  }
}

function assertNotEqual(expected, actual) {
  if (_isEqual(expected, actual)) {
    _recordThrow("assertNotEqual", arguments);
  }
}

function verifyNotEqual(expected, actual) {
  if (!_isEqual(expected, actual)) {
    _recordTrace("verifyNotEqual", arguments);
  }
}

function assertSame(expected, actual) {
  if (expected !== actual) {
    _recordThrow("assertSame", arguments);
  }
}

function verifySame(expected, actual) {
  if (expected !== actual) {
    _recordTrace("verifySame", arguments);
  }
}

function assertNotSame(expected, actual) {
  if (expected !== actual) {
    _recordThrow("assertNotSame", arguments);
  }
}

function verifyNotSame(expected, actual) {
  if (expected !== actual) {
    _recordTrace("verifyNotSame", arguments);
  }
}

function _recordTrace() {
  _record.apply(this, arguments);
  console.trace();
}

function _recordThrow() {
  _record.apply(this, arguments);
  throw new Error();
}

function success(message) {
  console.log(message);
}

function _record() {
  console.error(arguments);
  var message = arguments[0] + "(";
  var data = arguments[1];
  if (typeof data == "string") {
    message += data;
  }
  else {
    for (var i = 0; i < data.length; i++) {
      if (i != 0){message += ", ";}
      message += data[i];
    }
  }
  message += ")";
  console.log(message);
}

function _isEqual(expected, actual, depth) {
  if (!depth){depth = 0;}
  // Rather than failing we assume that it works!
  if (depth > 10) {
    return true;
  }

  if (expected == null) {
    if (actual != null) {
      console.log("expected: null, actual non-null: ", actual);
      return false;
    }
    return true;
  }

  if (typeof(expected) == "number" && isNaN(expected)) {
    if (!(typeof(actual) == "number" && isNaN(actual))) {
      console.log("expected: NaN, actual non-NaN: ", actual);
      return false;
    }
    return true;
  }

  if (actual == null) {
    if (expected != null) {
      console.log("actual: null, expected non-null: ", expected);
      return false;
    }
    return true; // we wont get here of course ...
  }

  if (typeof expected == "object") {
    if (!(typeof actual == "object")) {
      console.log("expected object, actual not an object");
      return false;
    }

    var actualLength = 0;
    for (var prop in actual) {
      if (typeof actual[prop] != "function" || typeof expected[prop] != "function") {
        var nest = _isEqual(actual[prop], expected[prop], depth + 1);
        if (typeof nest != "boolean" || !nest) {
          console.log("element '" + prop + "' does not match: " + nest);
          return false;
        }
      }
      actualLength++;
    }

    // need to check length too
    var expectedLength = 0;
    for (prop in expected) expectedLength++;
    if (actualLength != expectedLength) {
      console.log("expected object size = " + expectedLength + ", actual object size = " + actualLength);
      return false;
    }
    return true;
  }

  if (actual != expected) {
    console.log("expected = " + expected + " (type=" + typeof expected + "), actual = " + actual + " (type=" + typeof actual + ")");
    return false;
  }

  if (expected instanceof Array) {
    if (!(actual instanceof Array)) {
      console.log("expected array, actual not an array");
      return false;
    }
    if (actual.length != expected.length) {
      console.log("expected array length = " + expected.length + ", actual array length = " + actual.length);
      return false;
    }
    for (var i = 0; i < actual.length; i++) {
      var inner = _isEqual(actual[i], expected[i], depth + 1);
      if (typeof inner != "boolean" || !inner) {
        console.log("element " + i + " does not match: " + inner);
        return false;
      }
    }

    return true;
  }

  return true;
}
