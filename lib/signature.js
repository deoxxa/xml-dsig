var Signature = module.exports = function Signature(options) {
  this.privateKey = options.privateKey;
  this.publicKey = options.publicKey;
};

Signature.prototype.name = function name() {
  return null;
};

Signature.prototype.sign = function sign(data, cb) {
  setImmediate(function() {
    return cb(Error("not implemented"));
  });
};

Signature.prototype.verify = function verify(data, signature, cb) {
  setImmediate(function() {
    return cb(Error("not implemented"));
  });
};
