var util = require('util'),
    Transform = require('stream').Transform;

var trim = function(str) {
  return str.replace(/^\s+|\s+$/g, '');
};

function PayeesParser() {
  Transform.call(this, { objectMode: true });
  this.buffer = '';
}

util.inherits(PayeesParser, Transform);

PayeesParser.prototype._transform = function (chunk, encoding, done) {
  chunk = this.buffer + chunk.toString();
  var split = chunk.split('\n');
  this.buffer = split.pop();

  var self = this;
  split.forEach(function(line) { self.push(trim(line)); });

  done();
};

PayeesParser.prototype._flush = function (done) {
  if (this.buffer) {
    this.push(trim(this.buffer));
    this.buffer = null;
  }
  done();
};

// The accounts command displays the list of accounts used in a Ledger file.
module.exports.run = function(cli) {
  var process = cli.exec(['payees']);

  var pipes = process.stdout
    .pipe(new PayeesParser());

  // capture error from stdin and directly pipe this out
  // hack
  process.stdout.on('error', function (err) {
    pipes.emit('error', err);
  });

  return pipes;
};
