var c14n = require("xml-c14n")();

var ExclusiveCanonicalisation = module.exports = function ExclusiveCanonicalisation(options) {
  this.canonicaliser = c14n.createCanonicaliser("http://www.w3.org/2001/10/xml-exc-c14n#", options);
};

ExclusiveCanonicalisation.prototype.name = function name() {
  return this.canonicaliser.name();
};

ExclusiveCanonicalisation.prototype.canonicalise = function canonicalise(node, cb) {
  this.canonicaliser.canonicalise(node, cb);
};
