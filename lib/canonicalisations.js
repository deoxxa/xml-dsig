var c14n = require("xml-c14n");

var canonicalisations = module.exports = {};

canonicalisations["http://www.w3.org/2001/10/xml-exc-c14n#"] = {
  canonicalise: function canonicalise(node, inclusiveNamespaces) {
    return c14n.exc_c14n.canonicalise(node, false, inclusiveNamespaces || []);
  },
  name: function name() {
    return "http://www.w3.org/2001/10/xml-exc-c14n#";
  },
};

canonicalisations["http://www.w3.org/2001/10/xml-exc-c14n#WithComments"] = {
  canonicalise: function canonicalise(node, inclusiveNamespaces) {
    return c14n.exc_c14n.canonicalise(node, true, inclusiveNamespaces || []);
  },
  name: function name() {
    return "http://www.w3.org/2001/10/xml-exc-c14n#WithComments";
  },
};
