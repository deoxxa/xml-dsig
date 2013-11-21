var c14n = require("xml-c14n")(),
    xmldom = require("xmldom");

var Transform = require("../transform");

var ExclusiveCanonicalisationTransform = module.exports = function ExclusiveCanonicalisationTransform(options) {
  Transform.call(this, options);

  this.c14n = c14n.createCanonicaliser("http://www.w3.org/2001/10/xml-exc-c14n#", options);
};
ExclusiveCanonicalisationTransform.prototype = Object.create(Transform.prototype, {constructor: {value: ExclusiveCanonicalisationTransform}});

ExclusiveCanonicalisationTransform.prototype.name = function name() {
  return this.c14n.name();
};

ExclusiveCanonicalisationTransform.prototype.transform = function transform(node, cb) {
  if (Buffer.isBuffer(node)) {
    node = node.toString("utf8");
  }

  if (typeof node === "string") {
    node = new xmldom.DOMParser().parseFromString(node);
  }

  this.c14n.canonicalise(node, cb);
};
