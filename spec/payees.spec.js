var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    Ledger = require('../lib/ledger').Ledger;

describe('Payees', function() {
  var spec;
  var ledgerBinary = null;
  
  beforeEach(function() {
    spec = this;
    ledgerBinary = process.env.LEDGER_BIN || '/usr/local/bin/ledger';
  });

  describe('payees', function() {
    var ledger, entries;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/drewr.dat',
        debug: false
      });
      entries = [];
      
      ledger.payees()
        .on('data', function(entry) {
          entries.push(entry);
        })
        .once('end', function(){
          done();
        })
        .once('error', function(error) {
          assert.fail(error);
          done();
        });
    });

    it('should return a list of payees', function() {
      expect(entries.length).to.equal(9);
      expect(entries).to.eql([
        "Acme Mortgage",
        "Bank",
        "Book Store",
        "Checking balance",
        "Employer",
        "Grocery Store",
        "Organic Co-op",
        "Sale",
        "Tom’s Used Cars"
      ]);
    });
  });
});
