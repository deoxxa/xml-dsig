#!/usr/bin/env node

//
// $ openssl genrsa > signer.key
// $ openssl rsa -pubout < signer.key > signer.pub
//

var fs = require("fs"),
    xmldom = require("xmldom");

var dsig = require("./");

var xml = "<x/>",
    doc = (new xmldom.DOMParser()).parseFromString(xml);

var node = doc.documentElement;

var signed = dsig.createSignature(node, {
  signatureOptions: {
    privateKey: fs.readFileSync("./signer.key"),
    publicKey: fs.readFileSync("./signer.pub"),
  }
});

console.log("");

console.log(node.toString());
console.log("");

console.log(signed.toString());
console.log("");

console.log(dsig.canonicalisations["http://www.w3.org/2001/10/xml-exc-c14n#"].canonicalise(signed));
console.log("");
