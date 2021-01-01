var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    Ledger = require('../lib/ledger').Ledger;
  
describe('Register', function() {
  var spec;
  var ledgerBinary = null;
  
  beforeEach(function() {
    spec = this;
    ledgerBinary = process.env.LEDGER_BIN || '/usr/local/bin/ledger';
  });
  
  describe('single transaction', function() {
    var ledger, entries;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/single-transaction.dat',
        debug: false
      });
      entries = [];
      
      ledger.register()
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

    it('should return entry for single transaction', function() {
      expect(entries.length).to.equal(1);
    });

    it('should parse transaction', function() {
      var transaction = entries[0];
      expect(transaction.postings[0].date - new Date(Date.UTC(2013, 2, 19))).to.equal(0);
      expect(transaction.payee).to.equal('My Employer');
    });

    it('should parse the first posting', function() {
      var posting = entries[0].postings[0];
      expect(posting).to.eql({
        begLine: 2,
        endLine: 2,
        date: new Date(Date.UTC(2013,2,19)),
        effectiveDate: new Date(Date.UTC(2013,2,20)),
        pending: true,
        cleared: false,
        amount: {
          commodity: '£',
          quantity: 1000,
          formatted: '£1,000.00'
        },
        account: 'Assets:Checking'
      });
    });
    
    it('should parse the second posting', function() {
      var posting = entries[0].postings[1];
      expect(posting).to.eql({
        begLine: 3,
        endLine: 3,
        date: new Date(Date.UTC(2013,2,19)),
        effectiveDate: new Date(Date.UTC(2013,2,18)),
        pending: false,
        cleared: true,
        amount: {
          commodity: '£',
          quantity: -1000,
          formatted: '£-1,000.00'
        },
        account: 'Income:Salary'
      });
    });
  });
  
  describe('filtering by account', function() {
    var ledger, entries;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/drewr.dat',
      });
      entries = [];

      ledger.register({account: 'Income'})
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

    it('should return entries for two matching transactions', function() {
      expect(entries.length).to.equal(2);
    });

    it('should parse first transaction', function() {
      var transaction = entries[0];
      expect(transaction.payee).to.equal('Employer');
      expect(transaction.postings.length).to.equal(1);
      expect(transaction.postings[0].date - new Date(Date.UTC(2004, 0, 5))).to.equal(0);
    });
    
    it('should parse second transaction', function() {
      var transaction = entries[1];
      expect(transaction.payee).to.equal('Sale');
      expect(transaction.postings.length).to.equal(1);
      expect(transaction.postings[0].date - new Date(Date.UTC(2004, 1, 1))).to.equal(0);
    });
  });
  
  // Handle transactions where the payee contains a double quote (')
  describe('quoted transaction', function() {
    var ledger, entries;
    
    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/quoted-transaction.dat',
      });
      entries = [];
      
      ledger.register()
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

    it('should return entry for single transaction', function() {
      expect(entries.length).to.equal(1);
    });
  });

  describe('foreign currency transaction', function() {
    var ledger, entries;

    beforeEach(function(done) {
      ledger = new Ledger({
        file: 'spec/data/foreign-currency-transaction.dat',
      });
      entries = [];

      ledger.register()
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

    it('should return single entry for transaction', function() {
      expect(entries.length).to.equal(1);
    });

    it('should parse currency correctly', function() {
      var transaction = entries[0];
      var firstPosting = transaction.postings[0];
      var secondPosting = transaction.postings[1];

      expect(firstPosting.amount.commodity).to.equal('STOCKSYMBOL');
      expect(firstPosting.amount.quantity).to.equal(50);

      expect(secondPosting.amount.commodity).to.equal('CAD');
      expect(secondPosting.amount.quantity).to.equal(-9000);
    });

  });
});
