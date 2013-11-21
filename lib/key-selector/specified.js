var xpath = require("xpath");

var KeySelector = require("../key-selector");

var SpecifiedKeySelector = module.exports = function SpecifiedKeySelector(options) {
  KeySelector.call(this, options);

  options = options || {};

  this.keyInfo = options.keyInfo || {};
};
SpecifiedKeySelector.prototype = Object.create(KeySelector.prototype, {constructor: {value: SpecifiedKeySelector}});

SpecifiedKeySelector.prototype.findKey = function findKey(subject, cb) {
  return cb(null, this.keyInfo);
};
