var chai = require('chai'),
    fs = require('fs'),
    expect = chai.expect,
    Ledger = require('../lib/ledger').Ledger;

describe('Stdin', function() {
  var spec;
  var ledgerBinary = null;
  
  beforeEach(function() {
    spec = this;
    ledgerBinary = process.env.LEDGER_BIN || '/usr/local/bin/ledger';
  });
  
  describe('pass string instead of file to ledger', function() {
    var ledger, accounts;
    
    beforeEach(function(done) {
      var dat = fs.readFileSync('./spec/data/single-transaction.dat', 'utf8');

      ledger = new Ledger({
        string: dat,
      });
      accounts = [];

      ledger.accounts()
        .on('data', function(account) {
          accounts.push(account);
        })
        .once('error', function(error) {
          spec.fail(error);
          done();
        })
        .once('end', function(){
          done();
        });
    });

    it('should return two accounts', function() {
      expect(accounts.length).to.equal(2);
    });

    it('should return accounts listed alphabetically', function() {
      expect(accounts).to.eql([
        'Assets:Checking',
        'Income:Salary'
      ]);
    });
  });
});