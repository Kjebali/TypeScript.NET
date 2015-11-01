/*
 * @author electricessence / https://github.com/electricessence/
 * Licensing: MIT https://github.com/electricessence/TypeScript.NET/blob/master/LICENSE.md
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.areEqual = areEqual;
exports.compare = compare;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Types = require('./Types');

var _Types2 = _interopRequireDefault(_Types);

var isTrueNaN = _Types2['default'].isTrueNaN;

function areEqual(a, b) {
    var strict = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    return a === b || !strict && a == b || isTrueNaN(a) && isTrueNaN(b);
}

function compare(a, b) {
    var strict = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    if (areEqual(a, b, strict)) return 0;
    if (a > b || strict && (a === 0 && b == 0 || a === null && b === undefined)) return 1;
    if (b > a || strict && (b === 0 && a == 0 || b === null && a === undefined)) return -1;
    return NaN;
}
//# sourceMappingURL=Compare.js.map