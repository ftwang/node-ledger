var chai = require('chai'),
    expect = chai.expect,
    Ledger = require('../lib/ledger').Ledger;

describe('Error', function() {
  var spec;
  var ledgerBinary = null;
  
  beforeEach(function() {
    spec = this;
    ledgerBinary = process.env.LEDGER_BIN || '/usr/local/bin/ledger';
  });
  
  describe('display parsing error from ledger', function() {
    var ledger;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/non-existant.dat',
        debug: false
      });
      done();
    });

    it('should throw error stating file does not exist', function (done) {
      ledger.balance()
        .once('end', function(){
          done();
        })
        .on('error', function(error) {
          expect(error).to.match(/^Error: Cannot read journal file/);
          done();
        });
    });
  });
});
