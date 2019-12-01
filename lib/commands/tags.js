var util = require('util'),
    Transform = require('stream').Transform;

var trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

function TagsParser() {
  Transform.call(this, { objectMode: true });
  this.buffer = '';
}

util.inherits(TagsParser, Transform);

TagsParser.prototype._transform = function (chunk, encoding, done) {
  chunk = this.buffer + chunk.toString();
  var split = chunk.split('\n');
  this.buffer = split.pop();

  var self = this;
  split.forEach(function(line) { self.push(trim(line)); });

  done();
};

TagsParser.prototype._flush = function (done) {
  if (this.buffer) {
    this.push(trim(this.buffer));
    this.buffer = null;
  }
  done();
};

// The accounts command displays the list of accounts used in a Ledger file.
module.exports.run = function(cli) {
  var process = cli.exec(['tags']);

  return process.stdout
    .pipe(new TagsParser());
};
