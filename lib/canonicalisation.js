var Canonicalisation = module.exports = function Canonicalisation() {};

Canonicalisation.prototype.name = function name() {
  return null;
};

Canonicalisation.prototype.canonicalise = function canonicalise(node, cb) {
  setImmediate(function() {
    return cb(Error("not implemented"));
  });
};
