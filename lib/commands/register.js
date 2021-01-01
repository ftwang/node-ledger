var util = require('util'),
    Transform = require('stream').Transform,
    csv = require('csv-streamify'),
    EscapeQuotes = require('../escape-quotes').EscapeQuotes,
    DateParser = require('../dateParser').DateParser;

function RegisterParser() {
  Transform.call(this, { objectMode: true });
  this.current = null;
}

util.inherits(RegisterParser, Transform);

RegisterParser.prototype._transform = function (chunk, encoding, done) {
  this.parse(chunk);
  done();
};

RegisterParser.prototype._flush = function(done) {
  this.emitCurrent();
  done();
};

RegisterParser.prototype.parse = function(data) {
  try {
    // If payee is not empty, this is the beginning of a new transaction
    if (data[7].length !== 0) {
      this.emitCurrent();
      this.parseCurrent(data);
    }
    // parse posting for this current transaction
    this.appendPosting(data);
  } catch (ex) {
    this.emit('error', 'Failed to parse transaction: ' + ex);
  }
};

RegisterParser.prototype.emitCurrent = function() {
  if (this.current !== null) {
    // emit completed record        
    this.push(this.current);
    // console.log(this.current);
    this.current = null;
  }
};

RegisterParser.prototype.parseCurrent = function(data) {
  this.current = {
    date: this.toDate(data[2]),
    effectiveDate: this.toDate(data[3]),
    code: data[6],
    payee: data[7],
    postings: []
  };
};

RegisterParser.prototype.appendPosting = function(data) {
  this.current.postings.push({
    begLine: parseInt(data[0]),
    endLine: parseInt(data[1]),
    date: this.toDate(data[2]),
    effectiveDate: this.toDate(data[3]),
    cleared: data[4] === 'true',
    pending: data[5] === 'true',
    account: data[8],
    amount: {
      commodity: data[9],
      quantity: parseFloat(data[10].replace(/,/g, '')),
      formatted: data[11].replace(/[\r\n]+/g,'')
    }
  });
};

RegisterParser.prototype.toDate = function(str) {
  return DateParser.parse(str);
};

var transactionFormat = [
  '%(beg_line)',
  '%(end_line)',
  '%(quoted(date))',
  '%(effective_date ? quoted(effective_date) : "")',
  '%(cleared ? "true" : "false")',
  '%(pending ? "true" : "false")',
  '%(code ? quoted(code) : "")',
  '%(quoted(payee))',
  '%(quoted(display_account))',
  '%(quoted(commodity(scrub(display_amount))))',
  '%(quoted(quantity(scrub(display_amount))))',
  '%(quoted(amount))'
];

var postingFormat = [
  '%(beg_line)',
  '%(end_line)',
  '%(quoted(date))',
  '%(effective_date ? quoted(effective_date) : "")',
  '%(cleared ? "true" : "false")',
  '%(pending ? "true" : "false")',
  '',
  '',
  '%(quoted(display_account))',
  '%(quoted(commodity(scrub(display_amount))))',
  '%(quoted(quantity(scrub(display_amount))))',
  '%(quoted(amount))'
];

// The `ledger register` command displays all the postings occurring in a single account, line by line. 
module.exports.run = function(cli, opts) {
  var format = transactionFormat.join(',') + '\\n%/' + postingFormat.join(',') + '\\n',
      args = ['register'],
      options = opts || {};

  // Allow filtering by a given account name
  if (options.account) {
    args.push('^' + options.account);
  }

  args.push('--format');
  args.push(format);

  if (options.market) {
    args.push('--market');
  }

  if (options.current) {
    args.push('--current');
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

  if (options.related) {
    args.push('--related');
  }

  if (options['related-all']) {
    args.push('--related-all');
  }

  if (options.exchange) {
    args.push(`--exchange ${options.exchange}`);
  }

  var process = cli.exec(args);
  
  var pipes = process.stdout
    .pipe(new EscapeQuotes())
    .pipe(csv({ objectMode: true }))
    .pipe(new RegisterParser());

  // capture error from stdin and directly pipe this out
  // hack
  process.stdout.on('error', function (err) {
    pipes.emit('error', err);
  });

  return pipes;
};