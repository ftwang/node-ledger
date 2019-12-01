var util = require('util'),
    Transform = require('stream').Transform,
    csv = require('csv-streamify'),
    EscapeQuotes = require('../escape-quotes').EscapeQuotes,
    CommodityParser = require('../commodityParser').CommodityParser;

function BalanceParser() {
  Transform.call(this, { objectMode: true });
}

util.inherits(BalanceParser, Transform);

BalanceParser.prototype._transform = function (chunk, encoding, done) {
  this.parse(chunk);
  done();
};

BalanceParser.prototype.parse = function(data) {
  try {
    var total = data[3].split("\\n").map( x => CommodityParser.parse(x));

    var balance = {
      total: total,
      account: {
        fullname: data[0],
        shortname: data[1],
        depth: parseInt(data[2], 10)
      }
    };
    // console.log(balance);
    this.push(balance);
  } catch (ex) {
    this.emit('error', 'Failed to parse balance: ' + ex);
  }
};

// `ledger balance` output format to allow parsing as a CSV string
var format = '%(quoted(account)),%(quoted(partial_account)),%(depth),%(quoted(join(strip(display_total))))\n%/';

// The balance command reports the current balance of all accounts.
module.exports.run = function(cli, options) {
  var args = ['balance', '--format', format];

  options = options || {};
  if (options.collapse) {
    args.push('--collapse');
  }

  if (options.market) {
    args.push('--market');
  }

  if (options.current) {
    args.push('--current');
  }
  
  if (options.empty) {
    args.push('--empty');
  }

  if (options.basis) {
    args.push('--basis');
  }
  
  if (options.effective) {
    args.push('--effective');
  }

  if (options.cleared) {
    args.push('--cleared');
  }

  if (options.uncleared) {
    args.push('--uncleared');
  }

  if (options.pending) {
    args.push('--pending');
  }

  if (options.lots) {
    args.push('--lots');
  }

  if (options.exchange) {
    args.push('--exchange');
    args.push(options.exchange);
  }

  var process = cli.exec(args);

  return process.stdout
    .pipe(new EscapeQuotes())
    .pipe(csv({ objectMode: true }))
    .pipe(new BalanceParser());
};
