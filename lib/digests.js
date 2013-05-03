var crypto = require("crypto");

var digests = module.exports = {};

digests["http://www.w3.org/2000/09/xmldsig#sha1"] = {
  digest: function digest(data) {
    return crypto.createHash("sha1").update(data).digest("base64");
  },
  name: function name() {
    return "http://www.w3.org/2000/09/xmldsig#sha1";
  },
};

digests["http://www.w3.org/2001/04/xmldsig-more#sha224"] = {
  digest: function digest(data) {
    return crypto.createHash("sha224").update(data).digest("base64");
  },
  name: function name() {
    return "http://www.w3.org/2001/04/xmldsig-more#sha224";
  },
};

digests["http://www.w3.org/2001/04/xmldsig-more#sha384"] = {
  digest: function digest(data) {
    return crypto.createHash("sha384").update(data).digest("base64");
  },
  name: function name() {
    return "http://www.w3.org/2001/04/xmldsig-more#sha384";
  },
};

digests["http://www.w3.org/2001/04/xmlenc#sha256"] = {
  digest: function digest(data) {
    return crypto.createHash("sha256").update(data).digest("base64");
  },
  name: function name() {
    return "http://www.w3.org/2001/04/xmlenc#sha256";
  },
};

digests["http://www.w3.org/2001/04/xmlenc#sha512"] = {
  digest: function digest(data) {
    return crypto.createHash("sha512").update(data).digest("base64");
  },
  name: function name() {
    return "http://www.w3.org/2001/04/xmlenc#sha512";
  },
};
