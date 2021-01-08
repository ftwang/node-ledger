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
  
  describe('single transaction, multiple accounts', async function() {
    var ledger, accounts;
    
    beforeEach(async () => {
      ledger = new Ledger({
        file: 'spec/data/single-transaction.dat',
      });
      accounts = [];

      try {
        for await (var account of ledger.accounts()) {
          accounts.push(account);
        }
      } catch (error) {
        spec.fail(error);
      }
      
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
