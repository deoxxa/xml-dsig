var async = require("async"),
    http = require("http"),
    https = require("https"),
    randomId = require("proquint-random-id"),
    url = require("url"),
    xmldom = require("xmldom"),
    xpath = require("xpath");

var _request = function _request(uri, cb, _state) {
  if (typeof _state !== "object" || _state === null) {
    _state = {};
  }

  if (typeof _state.redirects !== "number") {
    _state.redirects = 0;
  }

  if (typeof uri === "string") {
    uri = url.parse(uri);
  }

  var transport = http;
  if (uri.protocol === "https:") {
    transport = https;
  }

  var req = transport.get(uri, function(res) {
    if (res.statusCode === 302 && res.headers.location) {
      _state.redirects++;

      if (_state.redirects > 20) {
        return cb(Error("too many redirects"));
      }

      return _request(url.resolve(uri, res.headers.location), cb, _state);
    }

    res.on("error", cb);

    var chunks = [];

    res.on("data", function(chunk) {
      chunks.push(chunk);
    });

    res.on("end", function() {
      try {
        var data = Buffer.concat(chunks).toString("utf8");
      } catch (e) {
        return cb(e);
      }

      return cb(null, res, data);
    });
  });

  req.on("error", cb);

  return req.end();
};

var builtIn = {
  transforms: require("./transforms"),
  canonicalisationMethods: require("./canonicalisations"),
  digestMethods: require("./digests"),
  signatureMethods: require("./signatures"),
  keySelectors: require("./key-selectors"),
};

var DigitalSignature = module.exports = function DigitalSignature() {
  if (!(this instanceof DigitalSignature)) {
    return new DigitalSignature();
  }

  this.transforms = Object.create(builtIn.transforms);
  this.canonicalisationMethods = Object.create(builtIn.canonicalisationMethods);
  this.digestMethods = Object.create(builtIn.digestMethods);
  this.signatureMethods = Object.create(builtIn.signatureMethods);
  this.keySelectors = Object.create(builtIn.keySelectors);
};

// feel free to replace this at runtime if you want/need more functionality
DigitalSignature.prototype._request = _request;

DigitalSignature.prototype.registerTransform = function registerTransform(uri, implementation) {
  this.transforms[uri] = implementation;

  return this;
};

DigitalSignature.prototype.createTransform = function createTransform(uri, options) {
  return this.transforms[uri](options);
};

DigitalSignature.prototype.registerCanonicalisationMethod = function registerCanonicalisationMethod(uri, implementation) {
  this.canonicalisationMethods[uri] = implementation;

  return this;
};

DigitalSignature.prototype.createCanonicalisationMethod = function createCanonicalisationMethod(uri, options) {
  return this.canonicalisationMethods[uri](options);
};

DigitalSignature.prototype.registerDigestMethod = function registerDigestMethod(uri, implementation) {
  this.digestMethods[uri] = implementation;

  return this;
};

DigitalSignature.prototype.createDigestMethod = function createDigestMethod(uri, options) {
  return this.digestMethods[uri](options);
};

DigitalSignature.prototype.registerSignatureMethod = function registerSignatureMethod(uri, implementation) {
  this.signatureMethods[uri] = implementation;

  return this;
};

DigitalSignature.prototype.createSignatureMethod = function createSignatureMethod(uri, options) {
  return this.signatureMethods[uri](options);
};

DigitalSignature.prototype.registerKeySelector = function registerKeySelector(uri, implementation) {
  this.keySelectors[uri] = implementation;

  return this;
};

DigitalSignature.prototype.createKeySelector = function createKeySelector(uri, options) {
  return this.keySelectors[uri](options);
};

DigitalSignature.prototype.applyTransforms = function applyTransforms(subject, options, cb) {
  var transforms = options.transforms ? options.transforms.slice() : [];

  var begin = function begin(cb) {
    return cb(null, subject.cloneNode(true));
  };

  async.waterfall([begin].concat(transforms.map(function(transform) {
    return transform.transform.bind(transform);
  })), cb);
};

DigitalSignature.prototype.resolveReference = function resolveReference(parent, uri, cb) {
  if (uri.length === 0) {
    setImmediate(function() {
      return cb(null, parent);
    });
  } else if (uri.indexOf("#") === 0) {
    setImmediate(function() {
      var reference = xpath.select1("//*[@ID='" + uri.substr(1) + "']", parent);

      return cb(null, reference);
    });
  } else {
    this._request(uri, function(err, res, data) {
      if (err) {
        return cb(err);
      }

      return cb(null, data);
    });
  }
};

DigitalSignature.prototype.createReferenceFromNode = function createReferenceFromNode(subject, options, cb) {
  var transforms = options.transforms ? options.transforms.slice() : [];
  transforms.push(this.createTransform("http://www.w3.org/2001/10/xml-exc-c14n#"));

  var digestMethod = options.digestMethod || this.createDigestMethod("http://www.w3.org/2000/09/xmldsig#sha1");

  var document = new xmldom.DOMImplementation().createDocument();

  var referenceElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:Reference");
  referenceElement.setAttribute("xmlns:ds", "http://www.w3.org/2000/09/xmldsig#");
  if (options.uri) {
    referenceElement.setAttribute("URI", options.uri);
  }

  var transformsElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:Transforms");
  referenceElement.appendChild(transformsElement);

  for (var i=0;i<transforms.length;++i) {
    var transformElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:Transform");
    transformElement.setAttribute("Algorithm", transforms[i].name());
    transformsElement.appendChild(transformElement);
  }

  var digestMethodElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:DigestMethod");
  referenceElement.appendChild(digestMethodElement);
  digestMethodElement.setAttribute("Algorithm", digestMethod.name());

  var digestValueElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:DigestValue");
  referenceElement.appendChild(digestValueElement);

  this.applyTransforms(subject, {transforms: transforms}, function(err, data) {
    if (err) {
      return cb(err);
    }

    digestMethod.digest(data, function(err, digestValue) {
      if (err) {
        return cb(err);
      }

      digestValueElement.appendChild(document.createTextNode(digestValue));

      cb(null, referenceElement);
    });
  });
};

DigitalSignature.prototype.createReferenceFromUrl = function createReferenceFromUrl(subject, _options, cb) {
  var options = Object.create(_options || null);

  options.uri = subject;

  var self = this;
  this._request(subject, function(err, res, data) {
    if (err) {
      return cb(err);
    }

    try {
      var document = (new xmldom.DOMParser()).parseFromString(data);
    } catch (e) {
      return cb(e);
    }

    return self.createReferenceFromNode(document.documentElement, options, cb);
  });
};

DigitalSignature.prototype.createSignedInfo = function createSignedInfo(options, cb) {
  var canonicalisationMethod = options.canonicalisationMethod || this.createCanonicalisationMethod("http://www.w3.org/2001/10/xml-exc-c14n#"),
      signatureMethod = options.signatureMethod || this.createSignatureMethod("http://www.w3.org/2000/09/xmldsig#rsa-sha1"),
      references = options.references;

  var document = new xmldom.DOMImplementation().createDocument();

  var signedInfoElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:SignedInfo");
  signedInfoElement.setAttribute("xmlns:ds", "http://www.w3.org/2000/09/xmldsig#");

  var canonicalisationMethodElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:CanonicalizationMethod");
  canonicalisationMethodElement.setAttribute("Algorithm", canonicalisationMethod.name());
  signedInfoElement.appendChild(canonicalisationMethodElement);

  var signatureMethodElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:SignatureMethod");
  signatureMethodElement.setAttribute("Algorithm", signatureMethod.name());
  signedInfoElement.appendChild(signatureMethodElement);

  for (var i=0;i<references.length;++i) {
    signedInfoElement.appendChild(references[i]);
  }

  setImmediate(function() {
    return cb(null, signedInfoElement);
  });
};

DigitalSignature.prototype.createSignature = function createSignature(options, cb) {
  var canonicalisationMethod = options.canonicalisationMethod || this.createCanonicalisationMethod("http://www.w3.org/2001/10/xml-exc-c14n#"),
      signatureMethod = options.signatureMethod || this.createSignatureMethod("http://www.w3.org/2000/09/xmldsig#rsa-sha1");

  var document = new xmldom.DOMImplementation().createDocument();

  var signatureElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:Signature");
  signatureElement.setAttribute("xmlns:ds", "http://www.w3.org/2000/09/xmldsig#");

  var self = this;

  this.createSignedInfo(options, function(err, signedInfoElement) {
    if (err) {
      return cb(err);
    }

    signatureElement.appendChild(signedInfoElement);

    var signatureValueElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:SignatureValue");
    signatureElement.appendChild(signatureValueElement);

    canonicalisationMethod.canonicalise(signedInfoElement, function(err, data) {
      if (err) {
        return cb(err);
      }

      signatureMethod.sign(data, function(err, signature) {
        if (err) {
          return cb(err);
        }

        signatureValueElement.appendChild(document.createTextNode(signature));

        setImmediate(function() {
          return cb(null, signatureElement);
        });
      });
    });
  });
};

DigitalSignature.prototype.verifySignature = function verifySignature(options, signatureElement, cb) {
  var self = this;

  if (typeof signatureElement === "function") {
    cb = signatureElement;
    signatureElement = null;
  }

  if (typeof options === "object" && options !== null && options.ownerDocument) {
    signatureElement = options;
    options = null;
  }

  options = options || {};

  var keySelector = options.keySelector || this.createKeySelector("embedded-x509");

  keySelector.findKey(signatureElement, function(err, keyInfo) {
    if (err) {
      return cb(err);
    }

    var signatureValueElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='SignatureValue']", signatureElement);
    var signatureValue = xpath.select("./text()", signatureValueElement).toString();

    var signedInfoElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='SignedInfo']", signatureElement);

    var canonicalisationMethodElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='CanonicalizationMethod']", signedInfoElement),
        signatureMethodElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='SignatureMethod']", signedInfoElement);

    var canonicalisationMethodAlgorithm = canonicalisationMethodElement.getAttribute("Algorithm"),
        signatureMethodAlgorithm = signatureMethodElement.getAttribute("Algorithm");

    var canonicalisationMethod = self.createCanonicalisationMethod(canonicalisationMethodAlgorithm),
        signatureMethod = self.createSignatureMethod(signatureMethodAlgorithm, {keyInfo: keyInfo});

    canonicalisationMethod.canonicalise(signedInfoElement, function(err, data) {
      if (err) {
        return cb(err);
      }

      signatureMethod.verify(data, signatureValue, function(err, valid) {
        if (err) {
          return cb(err);
        }

        if (!valid) {
          return cb(Error("signature was invalid"));
        }

        var referenceElements = xpath.select("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='Reference']", signedInfoElement);

        async.map(referenceElements, function(referenceElement, cb) {
          var referencedElementURI = referenceElement.getAttribute("URI");

          self.resolveReference(referenceElement.ownerDocument, referencedElementURI, function(err, referencedElement) {
            if (err) {
              return cb(err);
            }

            if (!referencedElement) {
              return cb(Error("couldn't resolve reference `" + referencedElementURI + "'"));
            }

            var digestMethodElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='DigestMethod']", referenceElement);
            var digestMethodAlgorithm = digestMethodElement.getAttribute("Algorithm");

            var digestValueElement = xpath.select1("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='DigestValue']", referenceElement);
            var digestValue = xpath.select("./text()", digestValueElement).toString();

            var referenceTransformElements = xpath.select("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='Transforms']/*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='Transform']", referenceElement);

            var referenceTransforms = referenceTransformElements.map(function(referenceTransformElement) {
              var referenceTransformAlgorithm = referenceTransformElement.getAttribute("Algorithm");

              return self.createTransform(referenceTransformAlgorithm);
            });

            self.applyTransforms(referencedElement, {transforms: referenceTransforms}, function(err, data) {
              if (err) {
                return cb(err);
              }

              var digestMethod = self.createDigestMethod(digestMethodAlgorithm);

              digestMethod.digest(data, function(err, ourDigest) {
                if (err) {
                  return cb(err);
                }

                if (ourDigest !== digestValue) {
                  return cb(Error("digest value for `" + referencedElementURI + "' wasn't correct"));
                }

                return cb(null, {
                  uri: referencedElementURI,
                  transforms: referenceTransforms.map(function(transform) {
                    return transform.name();
                  }),
                  digest: ourDigest,
                });
              });
            });
          });
        }, function(err, referenceInfo) {
          if (err) {
            return cb(err);
          }

          return cb(null, {
            signatureValue: signatureValue,
            keyInfo: keyInfo,
            references: referenceInfo,
          });
        });
      });
    });
  });
};

DigitalSignature.prototype.signAndWrap = function signAndWrap(node, options, cb) {
  var self = this;

  var options = Object.create(options || null);

  options.transforms = options.transforms ? options.transforms.slice() : [];
  options.transforms.push(this.createTransform("http://www.w3.org/2001/10/xml-exc-c14n#"));

  var document = new xmldom.DOMImplementation().createDocument();

  var id = randomId();
  var objectElement = document.createElementNS("http://www.w3.org/2000/09/xmldsig#", "ds:Object");
  objectElement.setAttribute("ID", id);
  objectElement.appendChild(node.cloneNode(true));

  options.uri = "#" + id;

  this.createReferenceFromNode(objectElement, options, function(err, reference) {
    if (err) {
      return cb(err);
    }

    options.references = [reference];

    self.createSignature(options, function(err, signature) {
      if (err) {
        return cb(err);
      }

      signature.appendChild(objectElement);

      return cb(null, signature);
    });
  });
};

DigitalSignature.prototype.signAndInsert = function signAndInsert(node, options, cb) {
  var self = this;

  var options = Object.create(options || null);

  options.transforms = options.transforms ? options.transforms.slice() : [];
  options.transforms.unshift(this.createTransform("http://www.w3.org/2000/09/xmldsig#enveloped-signature"));
  options.transforms.push(this.createTransform("http://www.w3.org/2001/10/xml-exc-c14n#"));

  this.createReferenceFromNode(node, options, function(err, reference) {
    if (err) {
      return cb(err);
    }

    options.references = [reference];

    self.createSignature(options, function(err, signature) {
      if (err) {
        return cb(err);
      }

      node.appendChild(signature);

      return cb(null, signature);
    });
  });
};
