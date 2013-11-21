var X509KeySelector = require("./key-selector/x509"),
    SpecifiedKeySelector = require("./key-selector/specified");

var keySelectors = module.exports = {
  "embedded-x509": function(options) {
    return new X509KeySelector(options);
  },
  "specified": function(options) {
    return new SpecifiedKeySelector(options);
  },
};
