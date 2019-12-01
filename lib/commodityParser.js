var DateParser = require('./dateParser').DateParser;

var CommodityParser = {
  // Parse an amount from a given string that looks like one of the following
  // cases:
  //   £-1,000.00
  //   5 STOCKSYMBOL {USD200}
  //   -900.00 CAD {USD1.1111111111} [13-Mar-19]
  parse: function(data) {
    // Strip out unneeded details.
    var lotPrice = data.match(/{(.*)}/);
    var lotDate = data.match(/\[(.*)\]/);

    var lot = null;

    if (lotPrice !== null) {
      lot = CommodityParser.parse(lotPrice[1]);
    }

    if (lotDate !== null) {
      if (lot != null) {
        lot.date = DateParser.parse(lotDate[1]);
      }
    }

    data = data.replace(/{.*}/g, '');
    data = data.replace(/\[.*\]/g, '');
    data = data.trim();

    // Find the amount first.
    var amountMatch = data.match(/-?[0-9,.]+/);
    if (amountMatch == null) {
      throw ('Could not get amount from string: ' + data);
    }
    var amountString = amountMatch[0];

    // Strip commas and parse amount as a float.
    var quantity = parseFloat(amountString.replace(/,/g, ''));

    // Remove the amount from the data string, and use the rest as the commodity.
    var commodity = data.replace(amountString, '').trim();

    var result = {
      commodity: commodity,
      quantity: quantity,
      formatted: data
    };

    if (lot != null) {
      result.lot = lot;
    }

    return result;
  }
};

module.exports.CommodityParser = CommodityParser;
