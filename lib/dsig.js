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
  options.digestAlgorithm = options.digestAlgorithm || "http://www.w3.org/2001/04/xmlenc#sha256",
  options.signatureAlgorithm = options.signatureAlgorithm || "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
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

// TODO: maybe xpath or something, dunno
var findElement = function findElement(root, id) {
  if (root.getAttribute("ID") === id) {
    return root;
  }

  var node;
  for (var i=0;i<root.childNodes.length;++i) {
    if (node = findElement(root.childNodes[i], id)) {
      return node;
    }
  }

  return null;
};

dsig.verifySignature = function verifySignature(_node, _signatureElement, _options) {
  var node = _node.cloneNode(true),
      signatureElement = _signatureElement.cloneNode(true),
      options = Object.create(_options);

  var signedInfo = signatureElement.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "SignedInfo")[0];

  if (!signedInfo) {
    return false;
  }

  var referenceElements = signedInfo.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Reference");

  for (var i=0;i<referenceElements.length;++i) {
    var uri = referenceElements[i].getAttribute("URI");

    var target = null;
    if (uri === "") {
      target = node;
    } else if (uri[0] === "#") {
      target = findElement(node, uri.slice(1));
    }

    if (!target) {
      return false;
    }

    var transformsElement = referenceElements[i].getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Transforms")[0],
        digestMethodElement = referenceElements[i].getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "DigestMethod")[0],
        digestValueElement = referenceElements[i].getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "DigestValue")[0];

    if (!transformsElement || !digestMethodElement || !digestValueElement) {
      return false;
    }

    var transformElements = transformsElement.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Transform"),
        transforms = [];

    for (var j=0;j<transformElements.length;++j) {
      transforms.push(transformElements[j].getAttribute("Algorithm"));
    }

    var digestMethod = digestMethodElement.getAttribute("Algorithm"),
        digestValue = digestValueElement.childNodes[0].data;

    var transformed = transforms.reduce(function(node, algorithm) {
      return this.transforms[algorithm].transform(node);
    }.bind(this), node);

    var ourDigest = this.digests[digestMethod].digest(transformed);

    if (ourDigest !== digestValue) {
      return false;
    }
  }

  var canonicalisationMethodElement = signedInfo.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "CanonicalizationMethod")[0],
      signatureMethodElement = signedInfo.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "SignatureMethod")[0],
      signatureValueElement = signatureElement.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "SignatureValue")[0];

  if (!canonicalisationMethodElement || !signatureMethodElement || !signatureValueElement) {
    return false;
  }

  var canonicalisationMethod = canonicalisationMethodElement.getAttribute("Algorithm"),
      signatureMethod = signatureMethodElement.getAttribute("Algorithm"),
      signatureValue = signatureValueElement.childNodes[0].data;

  var canonicalisedSignedInfo = this.canonicalisations[canonicalisationMethod].canonicalise(signedInfo);

  return this.signatures[signatureMethod].verify(options.signatureOptions, canonicalisedSignedInfo, signatureValue);
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
