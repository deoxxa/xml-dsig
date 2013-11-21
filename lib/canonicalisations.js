var ExclusiveCanonicalisation = require("./canonicalisation/exclusive");

var canonicalisations = module.exports = {
  "http://www.w3.org/2001/10/xml-exc-c14n#": function(options) {
    return new ExclusiveCanonicalisation(options);
  },
  "http://www.w3.org/2001/10/xml-exc-c14n#WithComments": function(options) {
    options = Object.create(options || null);
    options.includeComments = true;

    return new ExclusiveCanonicalisation(options);
  },
};
