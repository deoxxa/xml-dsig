var crypto = require("crypto");

var signatures = module.exports = {};

signatures["http://www.w3.org/2000/09/xmldsig#rsa-sha1"] = {
  sign: function sign(options, data) {
    return crypto.createSign("RSA-SHA1").update(data).sign(options.privateKey, "base64");
  },
  verify: function verify(options, data, signature) {
    return crypto.createVerify("RSA-SHA1").update(data).verify(options.publicKey, signature, "base64");
  },
  name: function name() {
    return "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
  },
};

signatures["http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"] = {
  sign: function sign(options, data) {
    return crypto.createSign("RSA-SHA256").update(data).sign(options.privateKey, "base64");
  },
  verify: function verify(options, data, signature) {
    return crypto.createVerify("RSA-SHA256").update(data).verify(options.publicKey, signature, "base64");
  },
  name: function name() {
    return "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
  },
};
