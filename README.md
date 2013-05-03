xml-dsig
========

XML digital signatures (xmldsig)

Overview
--------

This module performs XML digital signature production and verification as
specified in [xmldsig-core](http://www.w3.org/TR/xmldsig-core/).

To operate, a preconstructed DOM object is required. Any object that implements
the [DOM Level 2](http://www.w3.org/TR/DOM-Level-2-Core/) API will suffice. I
recommend [xmldom](https://github.com/jindw/xmldom) if you're working with node,
or your browser's native DOM implementation if you're not.

Super Quickstart
----------------

Also see [example.js](https://github.com/deoxxa/xml-dsig/blob/master/example.js).

```javascript
//
// $ openssl genrsa 1024 > signer.key
// $ openssl rsa -pubout < signer.key > signer.pub
//

var fs = require("fs"),
    xmldom = require("xmldom");

var dsig = require("xml-dsig");

var xml = '<docs><doc id="doc-1"/><doc id="doc-2"/></docs>',
    doc = (new xmldom.DOMParser()).parseFromString(xml);

var options = {
  signatureOptions: {
    privateKey: fs.readFileSync("./signer.key"),
    publicKey: fs.readFileSync("./signer.pub"),
  }
};

var node = doc.documentElement;

var signature = dsig.createSignature(node, options),
    enveloped = dsig.insertEnvelopedSignature(node, options);

console.log("");

console.log(node.toString());
console.log("");

console.log(signature.toString());
console.log("");

console.log(enveloped.toString());
console.log("");

console.log(dsig.verifySignature(node, signature, options));
console.log("");
```

```
<docs><doc id="doc-1"/><doc id="doc-2"/></docs>

<Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><Reference URI=""><Transforms><Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><DigestValue>7CHcwH1bPS0AQ0mk/Js5PZv4nn1hiODMoG1iwa9kKRo=</DigestValue></Reference><CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/></SignedInfo><SignatureValue>UzjDCBHby6jvY/ZhyJCfz41l062uidQpI7VYTTF+Uix47zLiKFAPYVT6ICeZ5d8yYVEKWi5AydkStlj3OruwHupZdx27vy+EXRZM5If7xCWDCXuyf+vV3la9qkSk1CceLeDbwsz4dpIp08h+AkfJipPlMXuYhoqjj2bzjdqroh8=</SignatureValue></Signature>

<docs><doc id="doc-1"/><doc id="doc-2"/><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"><SignedInfo><Reference URI=""><Transforms><Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/><Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/></Transforms><DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256"/><DigestValue>7CHcwH1bPS0AQ0mk/Js5PZv4nn1hiODMoG1iwa9kKRo=</DigestValue></Reference><CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/><SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"/></SignedInfo><SignatureValue>S2Qt11e4wO5fJy41BMFS0YF2fiCSfF08WioXhgXRfp26QqDnTvCi5vIijFnbI/fFnqn01eOOGj3IDm26YMHfXoP6NSo6zECkj4OJDLxheuPvMJi5NRxSRRdGH2LeQ3qVRcPtxmz2+djdCQPM6YG7UAP2MKao0U7vydYwdIqGM7g=</SignatureValue></Signature></docs>

true
```

Installation
------------

Available via [npm](http://npmjs.org/):

> $ npm install xml-dsig

Or via git:

> $ git clone git://github.com/deoxxa/xml-dsig.git node_modules/xml-dsig

API
---

**dsig.createSignature**

Creates a signature element from an XML DOM node.

```javascript
dsig.createSignature(node, options);
```

```javascript
// returns a DOM node representing the Signature element

var signature = dsig.createSignature(node, {
  transforms: ["http://www.w3.org/2001/10/xml-exc-c14n#"],
  canonicalisationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
  digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
  signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
  signatureOptions: {
    privateKey: "...",
    publicKey: "...",
  },
});
```

Arguments

* _node_ - a DOM node implementing [DOM Level 2](http://www.w3.org/TR/DOM-Level-2-Core/)
* _options_ - an object specifying options for how to construct the signature

**dsig.verifySignature**

Verifies a signature given a DOM node, a signature element, and any required
parameters for the signature (keys, etc).

```javascript
dsig.verifySignature(node, signatureElement, options);
```

```javascript
var signatureIsValid = dsig.verifySignature(node, signatureElement, options);
```

Arguments

* _node_ - a DOM node implementing [DOM Level 2](http://www.w3.org/TR/DOM-Level-2-Core/)
* _signatureElement_ - a DOM node representing the XML signature to check
* _options_ - an object specifying options for how to construct the signature (see
  `createSignature` above for more information)

**dsig.insertEnvelopedSignature**

Creates a signature with an enveloped signature transformation applied and
returns a new element with the signature inserted as a child node.

```javascript
dsig.insertEnvelopedSignature(node, options);
```

```javascript
var newElement = dsig.insertEnvelopedSignature(node, options);
```

* _node_ - a DOM node implementing [DOM Level 2](http://www.w3.org/TR/DOM-Level-2-Core/)
* _options_ - an object specifying options for how to construct the signature (see
  `createSignature` above for more information)

License
-------

3-clause BSD. A copy is included with the source.

Contact
-------

* GitHub ([deoxxa](http://github.com/deoxxa))
* Twitter ([@deoxxa](http://twitter.com/deoxxa))
* ADN ([@deoxxa](https://alpha.app.net/deoxxa))
* Email ([deoxxa@fknsrs.biz](mailto:deoxxa@fknsrs.biz))
