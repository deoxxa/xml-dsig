var Transform = module.exports = function Transform(options) {};

Transform.prototype.name = function name() {
  return null;
};

Transform.prototype.transform = function transform(node, cb) {
  setImmediate(function() {
    return cb(Error("not implemented"));
  });
};

Transform.prototype.fromElement = function fromElement(node) {};
