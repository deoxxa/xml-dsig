var crypto = require("crypto");

var Digest = require("../digest");

var BasicDigest = module.exports = function BasicDigest(options) {
  Digest.call(this, options);

  options = Object.create(options || null);

  this.algorithm = options.algorithm || "sha1";
  this.uri = options.uri || "http://www.w3.org/2000/09/xmldsig#sha1";
};
BasicDigest.prototype = Object.create(Digest.prototype, {constructor: {value: BasicDigest}});

BasicDigest.prototype.name = function name() {
  return this.uri;
};

BasicDigest.prototype.digest = function digest(data, cb) {
  var self = this;

  setImmediate(function() {
    try {
      var digest = crypto.createHash(self.algorithm).update(data).digest("base64");
    } catch (e) {
      return cb(e);
    }

    return cb(null, digest);
  });
};
