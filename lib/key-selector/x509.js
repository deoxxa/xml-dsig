var xpath = require("xpath");

var KeySelector = require("../key-selector");

var X509KeySelector = module.exports = function X509KeySelector(options) {
  KeySelector.call(this, options);
};
X509KeySelector.prototype = Object.create(KeySelector.prototype, {constructor: {value: X509KeySelector}});

X509KeySelector.prototype.findKey = function findKey(subject, cb) {
  var certificateData = xpath.select("./*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='KeyInfo']/*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='X509Data']/*[namespace-uri()='http://www.w3.org/2000/09/xmldsig#' and local-name()='X509Certificate']/text()", subject).toString();

  if (!certificateData) {
    return cb(Error("couldn't find X509 data"));
  }

  if (certificateData.indexOf("-----BEGIN CERTIFICATE-----") === -1) {
    certificateData = [
      "-----BEGIN CERTIFICATE-----",
      certificateData.replace(/[\r\n]/g, "").match(/.{1,76}/g).join("\n"),
      "-----END CERTIFICATE-----",
    ].join("\n");
  }

  return cb(null, {certificate: certificateData});
};
