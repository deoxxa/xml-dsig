var X509KeySelector = require("./key-selector/x509");

var keySelectors = module.exports = {
  "embedded-x509": function(options) {
    return new X509KeySelector(options);
  },
};
