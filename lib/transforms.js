var c14n = require("xml-c14n");

var transforms = module.exports = {};

transforms["http://www.w3.org/2000/09/xmldsig#enveloped-signature"] = {
  transform: function transform(_node) {
    var node = _node.cloneNode(true);

    var signatureElements = node.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

    for (var i=0;i<signatureElements.length;++i) {
      if (signatureElements[i].parentNode === node) {
        signatureElements[i].parentNode.removeChild(signatureElements[i]);
      }
    }

    return node;
  },
  name: function name() {
    return "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
  },
};

transforms["http://www.w3.org/2001/10/xml-exc-c14n#"] = {
  transform: function transform(_node) {
    var node = _node.cloneNode(true);

    return c14n.exc_c14n.canonicalise(node, false);
  },
  name: function name() {
    return "http://www.w3.org/2001/10/xml-exc-c14n#";
  },
};
