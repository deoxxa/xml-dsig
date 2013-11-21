var BasicDigest = require("./digest/basic");

var digests = module.exports = {
  "http://www.w3.org/2000/09/xmldsig#sha1": function(options) {
    options = Object.create(options || null);
    options.algorithm = "sha1";
    options.uri = "http://www.w3.org/2000/09/xmldsig#sha1";
    return new BasicDigest(options);
  },
  "http://www.w3.org/2001/04/xmldsig-more#sha224": function(options) {
    options = Object.create(options || null);
    options.algorithm = "sha224";
    options.uri = "http://www.w3.org/2001/04/xmldsig-more#sha224";
    return new BasicDigest(options);
  },
  "http://www.w3.org/2001/04/xmldsig-more#sha384": function(options) {
    options = Object.create(options || null);
    options.algorithm = "sha384";
    options.uri = "http://www.w3.org/2001/04/xmldsig-more#sha384";
    return new BasicDigest(options);
  },
  "http://www.w3.org/2001/04/xmlenc#sha256": function(options) {
    options = Object.create(options || null);
    options.algorithm = "sha256";
    options.uri = "http://www.w3.org/2001/04/xmlenc#sha256";
    return new BasicDigest(options);
  },
  "http://www.w3.org/2001/04/xmlenc#sha512": function(options) {
    options = Object.create(options || null);
    options.algorithm = "sha512";
    options.uri = "http://www.w3.org/2001/04/xmlenc#sha512";
    return new BasicDigest(options);
  },
};
