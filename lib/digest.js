var Digest = module.exports = function Digest() {};

Digest.prototype.name = function name() {
  return null;
};

Digest.prototype.digest = function digest(data, cb) {
  setImmediate(function() {
    return cb(Error("not implemented"));
  });
};
