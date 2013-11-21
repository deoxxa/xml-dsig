#!/usr/bin/env node

//
// $ openssl genrsa 1024 > signer.key
// $ openssl rsa -pubout < signer.key > signer.pub
//

var fs = require("fs"),
    xmldom = require("xmldom");

var dsig = require("./")();

var xmlData = fs.readFileSync(process.argv[2] || "./doc.xml", "utf8"),
    xmlDocument = (new xmldom.DOMParser()).parseFromString(xmlData);

var privateKey = fs.readFileSync("./signer.key"),
    publicKey = fs.readFileSync("./signer.pub");

var options = {
  signatureMethod: dsig.createSignatureMethod("http://www.w3.org/2001/04/xmldsig-more#rsa-sha256", {
    keyInfo: {
      privateKey: privateKey,
      publicKey: publicKey,
    },
  }),
};

dsig.signAndInsert(xmlDocument.documentElement, options, function(err, signature) {
  if (err) {
    return console.warn(err.stack);
  }

  console.log("document\n========\n");
  console.log(xmlDocument + "\n");
  console.log("signature\n=========\n");
  console.log(signature + "\n");
});
