var crypto = require("crypto");

var Signature = require("../signature");

var BasicSignature = module.exports = function BasicSignature(options) {
  Signature.call(this, options);

  var keyInfo = options.keyInfo || {};

  this.uri = options.uri || "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
  this.algorithm = options.algorithm || "RSA-SHA256";
  this.privateKey = keyInfo.privateKey;
  this.publicKey = keyInfo.publicKey || keyInfo.certificate;
};
BasicSignature.prototype = Object.create(Signature.prototype, {constructor: {value: BasicSignature}});

BasicSignature.prototype.name = function name() {
  return this.uri;
};

BasicSignature.prototype.sign = function sign(data, cb) {
  var self = this;

  setImmediate(function() {
    try {
      var signature = crypto.createSign(self.algorithm).update(data).sign(self.privateKey, "base64");
    } catch (e) {
      return cb(e);
    }

    return cb(null, signature);
  });
};

BasicSignature.prototype.verify = function verify(data, signature, cb) {
  var self = this;

  setImmediate(function() {
    try {
      var valid = crypto.createVerify(self.algorithm).update(data).verify(self.publicKey, signature, "base64");
    } catch (e) {
      return cb(e);
    }

    return cb(null, valid);
  });
};
