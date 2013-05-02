var xmldom = require("xmldom");

var dsig = module.exports = {};

dsig.transforms = require("./transforms");
dsig.canonicalisations = require("./canonicalisations");
dsig.digests = require("./digests");
dsig.signatures = require("./signatures");

dsig.insertEnvelopedSignature = function insertEnvelopedSignature(_node, _options) {
  var node = _node.cloneNode(true),
      options = Object.create(_options);

  options.transforms = options.transforms || ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"];

  node.appendChild(this.createSignature(node, options));

  return node;
};

dsig.createSignature = function createSignature(_node, _options) {
  var node = _node.cloneNode(true),
      options = Object.create(_options);

  options.transforms = (options.transforms || ["http://www.w3.org/2001/10/xml-exc-c14n#"]).slice();
  options.canonicalisationAlgorithm = options.canonicalisationAlgorithm || "http://www.w3.org/2001/10/xml-exc-c14n#";
  options.digestAlgorithm = options.digestAlgorithm || "http://www.w3.org/2000/09/xmldsig#sha1",
  options.signatureAlgorithm = options.signatureAlgorithm || "http://www.w3.org/2000/09/xmldsig#rsa-sha1",
  options.signatureOptions = options.signatureOptions || {};

  var doc = (new xmldom.DOMImplementation()).createDocument();

  var signatureElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "Signature");
  signatureElement.setAttribute("xmlns", "http://www.w3.org/2000/09/xmldsig#");

  var signedInfoElement = this.createSignedInfoElement(node, options);
  signatureElement.appendChild(signedInfoElement);

  var signatureValueElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "SignatureValue");
  signatureElement.appendChild(signatureValueElement);

  var signatureValue = this.signatures[options.signatureAlgorithm].sign(options.signatureOptions, this.canonicalisations[options.canonicalisationAlgorithm].canonicalise(signedInfoElement));
  signatureValueElement.appendChild(doc.createTextNode(signatureValue));

  return signatureElement;
};

dsig.createSignedInfoElement = function createSignedInfoElement(_node, options) {
  var node = _node.cloneNode(true);

  var doc = (new xmldom.DOMImplementation()).createDocument();

  var signedInfoElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "SignedInfo");

  var referenceElement = this.createReferenceElement(node, options);
  signedInfoElement.appendChild(referenceElement);

  var canonicalisationAlgorithmElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "CanonicalizationMethod");
  canonicalisationAlgorithmElement.setAttribute("Algorithm", this.canonicalisations[options.canonicalisationAlgorithm].name());
  signedInfoElement.appendChild(canonicalisationAlgorithmElement);

  var signatureAlgorithmElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "SignatureMethod");
  signatureAlgorithmElement.setAttribute("Algorithm", this.signatures[options.signatureAlgorithm].name());
  signedInfoElement.appendChild(signatureAlgorithmElement);

  return signedInfoElement;
};

dsig.createReferenceElement = function createReferenceElement(_node, options) {
  var node = _node.cloneNode(true);

  var doc = (new xmldom.DOMImplementation()).createDocument();

  var referenceElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "Reference");
  referenceElement.setAttribute("URI", "");

  var transformsElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "Transforms");
  referenceElement.appendChild(transformsElement);

  options.transforms.forEach(function(algorithm) {
    var transformElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "Transform");
    transformElement.setAttribute("Algorithm", this.transforms[algorithm].name());
    transformsElement.appendChild(transformElement);
  }.bind(this));

  var digestMethodElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "DigestMethod");
  digestMethodElement.setAttribute("Algorithm", this.digests[options.digestAlgorithm].name());
  referenceElement.appendChild(digestMethodElement);

  var digestValueElement = doc.createElementNS("http://www.w3.org/2000/09/xmldsig#", "DigestValue");
  referenceElement.appendChild(digestValueElement);

  var transformed = options.transforms.reduce(function(node, algorithm) {
    return this.transforms[algorithm].transform(node);
  }.bind(this), node);

  if (typeof transformed !== "string") {
    options.transforms.push("http://www.w3.org/2001/10/xml-exc-c14n#");
    transformed = this.transforms["http://www.w3.org/2001/10/xml-exc-c14n#"].transform(transformed);
  }

  var digestValue = this.digests[options.digestAlgorithm].digest(transformed);
  digestValueElement.appendChild(doc.createTextNode(digestValue));

  return referenceElement;
};
