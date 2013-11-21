var BasicSignature = require("./signature/basic");

var signatures = module.exports = {
  "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256": function(options) {
    options = Object.create(options || null);
    options.uri = "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
    options.algorithm = "RSA-SHA256";
    return new BasicSignature(options);
  },
  "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256": function(options) {
    options = Object.create(options || null);
    options.uri = "http://www.w3.org/2001/04/xmldsig-more#ecdsa-sha256";
    options.algorithm = "ECDSA-SHA256";
    return new BasicSignature(options);
  },
  "http://www.w3.org/2000/09/xmldsig#dsa-sha1": function(options) {
    options = Object.create(options || null);
    options.uri = "http://www.w3.org/2000/09/xmldsig#dsa-sha1";
    options.algorithm = "DSA-SHA1";
    return new BasicSignature(options);
  },
  "http://www.w3.org/2000/09/xmldsig#rsa-sha1": function(options) {
    options = Object.create(options || null);
    options.uri = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
    options.algorithm = "RSA-SHA1";
    return new BasicSignature(options);
  },
};
