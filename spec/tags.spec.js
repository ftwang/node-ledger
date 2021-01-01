var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    Ledger = require('../lib/ledger').Ledger;

describe('Tags', function() {
  var spec;
  var ledgerBinary = null;
  
  beforeEach(function() {
    spec = this;
    ledgerBinary = process.env.LEDGER_BIN || '/usr/local/bin/ledger';
  });

  describe('tags', function() {
    var ledger, entries;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/drewr.dat',
        debug: false
      });
      entries = [];
      
      ledger.tags()
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
      expect(entries.length).to.equal(1);
      expect(entries).to.eql([
        "nobudget",
      ]);
    });
  });
});
