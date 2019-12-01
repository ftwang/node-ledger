# ledger-cli

API for the Ledger command-line interface ([ledger-cli.org](http://ledger-cli.org/)).

> Ledger is a powerful, double-entry accounting system that is accessed from the UNIX command-line.

MIT License

## Dependencies

  * [Ledger 3](http://ledger-cli.org/)
  * [Node.js](nodejs.org) and npm

### Installing Ledger

The simplest way to install Ledger 3 is through [Homebrew](http://mxcl.github.com/homebrew/).

```
brew install ledger --HEAD
```

The `--HEAD` option is required to install version 3.x.

## Usage

Install `ledger-cli` and its dependencies with npm.

```
npm install ledger-cli
```

Then require the library and use the exported Ledger class to [execute commands](#available-commands).

```js
var Ledger = require('ledger-cli').Ledger;
```

You must provide the path to the Ledger journal file via the  `file` option

```js
var ledger = new Ledger({ file: 'path/to/ledger/journal/file.dat' });
```

### Available commands

There are eight available Ledger commands.

* `accounts` - Lists all accounts for postings.
* `balance` - Reports the current balance of all accounts.
* `payees` - Lists all unique payees in the journal.
* `print` - Prints out the full transactions, sorted by date, using the same format as they would appear in a Ledger data file.
* `register` - Displays all the postings occurring in a single account.\
* `tags` - Lists all unique tags in the journal.
* `stats` - Retrieves statistics, like number of unique accounts.
* `version` - Gets the currently installed Ledger version number.

### Accounts

Lists all accounts for postings. It returns a readable object `stream`.

```js
ledger.accounts()
  .on('data', function(account) {
    // account is the name of an account (e.g. 'Assets:Current Account')
  });
```

### Balance

The balance command reports the current balance of all accounts. It returns a readable object `stream`.

```js
options = {};
ledger.balance(options)
  .on('data', function(entry) {
    // JSON object for each entry
    entry = {
      total: [{
        commodity: '£',
        quantity: 1000,
        formatted: '£1,000.00'
      }, {
        commodity: 'USD',
        quantity: 500,
        formatted: '500 USD'
      }],
      account: {
        fullname: 'Assets:Checking',
        shortname: 'Assets:Checking',
        depth: 2,
      }
    };
  })
  .once('end', function(){
    // completed
  })
  .once('error', function(error) {
    // error
  });
```

#### Option --cleared
Calculate account balances for cleared postings.

#### Option --current
Set end date to today

#### Option --effective
Use effective date instead of date.

#### Option --empty
Include accounts that have empty balances

```js
options = { empty: true };
ledger.balance(options)
  .on('data', function(entry) {
    // JSON object for each entry
    entry = {
      total: [{
        commodity: '',
        quantity: 0,
        formatted: '0'
      }],
      account: {
        fullname: 'Assets:Checking',
        shortname: 'Assets:Checking',
        depth: 2,
      }
    };
  })
  .once('end', function(){
    // completed
  })
  .once('error', function(error) {
    // error
  });
```

#### Option --exchange
The balance command will return the balances in the native commodity.  If conversion to a specific commodity is desired, pass option { `exchange` : `commodity` } to the `balance` command.  It will use the latest market exchange rate defined within the ledger document.

```js
options = { exchange: '£' };
ledger.balance(options)
  .on('data', function(entry) {
    // JSON object for each entry
    entry = {
      total: [{
        commodity: '£',
        quantity: 2000,
        formatted: '£2,000.00'
      }],
      account: {
        fullname: 'Assets:Checking',
        shortname: 'Assets:Checking',
        depth: 2,
      }
    };
  })
  .once('end', function(){
    // completed
  })
  .once('error', function(error) {
    // error
  });
```

#### Option --pending
Calculate account balances for pending postings.

#### Option --uncleared
Calculate account balances for uncleared postings.

### Payees

Lists all unique payees in journal. It returns a readable object `stream`.

```js
ledger.payees()
  .on('data', function(payee) {
    // payee is the name of an unique payee (e.g. 'Acme Mortgage')
  });
```

### Print

The print command formats the full list of transactions, ordered by date, using the same format as they would appear in a Ledger data file. It returns a readable stream.

```js
var fs = require('fs'),
    out = fs.createWriteStream('output.dat');

ledger.print().pipe(out);
```

### Register

The register command displays all the postings occurring in a single account. It returns a readable object `stream`.

```js
ledger.register()
  .on('data', function(entry) {
    // JSON object for each entry
    entry = {
      code: '',
      payee: 'Salary',
      postings: [{
        begLine: 1,
        endLine: 1,
        date: new Date(Date.UTC(2014, 1, 1)),
        effectiveDate: new Date(Date.UTC(2014,1,2)),
        cleared: true,
        pending: true,
        amount: {
          commodity: '£',
          quantity: 1000,
          formatted: '£1,000.00'
        },
        account: 'Assets:Checking'
      }]
    };
  })
  .once('end', function(){
    // completed
  })
  .once('error', function(error) {
    // error
  });
```

### Stats

The stats command is used to retrieve statistics about the Ledger data file. It requires a Node style callback function that is called with either an error or the stats object.

```js
ledger.stats(function(err, stats) {
  if (err) { return console.error(err); }

  // stats is a map (e.g. stats['Unique accounts'] = 13)
});
```

### Tags

Lists all unique tags in journal. It returns a readable object `stream`.

```js
ledger.tags()
  .on('data', function(tag) {
    // tag is the name of an unique tag (e.g. 'nobudget')
  });
```

### Version

The version command is used to get the Ledger binary version. It requires a Node style callback function that is called with either an error or the version number as a string.

```js
ledger.version(function(err, version) {
  if (err) { return console.error(err); }

  // version is a string (e.g. '3.0.0-20130529')
});
```
