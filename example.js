#!/usr/bin/env node

//
// $ openssl genrsa 1024 > signer.key
// $ openssl rsa -pubout < signer.key > signer.pub
//

var fs = require("fs"),
    xmldom = require("xmldom");

var dsig = require("./");

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
