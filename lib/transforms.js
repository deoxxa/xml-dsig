var EnvelopedSignatureTransform = require("./transform/enveloped-signature"),
    ExclusiveCanonicalisationTransform = require("./transform/exclusive-canonicalisation");

var transforms = module.exports = {
  "http://www.w3.org/2000/09/xmldsig#enveloped-signature": function(options) {
    return new EnvelopedSignatureTransform(options);
  },
  "http://www.w3.org/2001/10/xml-exc-c14n#": function(options) {
    return new ExclusiveCanonicalisationTransform(options);
  },
  "http://www.w3.org/2001/10/xml-exc-c14n#WithComments": function(options) {
    options = Object.create(options || null);
    options.includeComments = true;

    return new ExclusiveCanonicalisationTransform(options);
  },
};
