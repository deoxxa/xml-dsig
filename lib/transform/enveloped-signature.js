var xmldom = require("xmldom"),
    xpath = require("xpath");

var Transform = require("../transform");

var EnvelopedSignatureTransform = module.exports = function EnvelopedSignatureTransform(options) {
  Transform.call(this, options);
};
EnvelopedSignatureTransform.prototype = Object.create(Transform.prototype, {constructor: {value: EnvelopedSignatureTransform}});

EnvelopedSignatureTransform.prototype.name = function name() {
  return "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
};

EnvelopedSignatureTransform.prototype.transform = function transform(node, cb) {
  if (Buffer.isBuffer(node)) {
    node = node.toString("utf8");
  }

  if (typeof node === "string") {
    node = new xmldom.DOMParser().parseFromString(node);
  }

  var _node = node;

  setImmediate(function() {
    var node = _node.cloneNode(true);

    var signatureElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='Signature']", node);

    if (signatureElement) {
      node.removeChild(signatureElement);
    }

    return cb(null, node);
  });
};
