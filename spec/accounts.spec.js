var chai = require('chai'),
    expect = chai.expect,
    Ledger = require('../lib/ledger').Ledger;

describe('Accounts', function() {
  var spec;
  var ledgerBinary = null;
  
  beforeEach(function() {
    spec = this;
    ledgerBinary = process.env.LEDGER_BIN || '/usr/local/bin/ledger';
  });
  
  describe('single transaction, multiple accounts', function() {
    var ledger, accounts;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/single-transaction.dat',
        binary: ledgerBinary
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
