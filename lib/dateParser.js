var DateParser = {
  parse: function(str) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (str.length === 0) {
      return null;
    }
    
    var date = str.split(/[\/\-]/);
    var idxYear = 0;
    var idxMonth = 1;
    var idxDay = 2;
  
    if (date[2] > 99) {
      idxYear = 2;
      idxMonth = 0;
      idxDay = 1;
    }
  
    var year = parseInt(date[idxYear]);
    var month = parseInt(date[idxMonth]);
    var day = parseInt(date[idxDay]);
  
    if (isNaN(month)) {
      if (months.indexOf(date[idxMonth])) {
        month = months.indexOf(date[idxMonth]) + 1;
      } else {
        // Can't parse date
        return null;
      }
    }
    if (year < 100) {
      year = year + 2000;
    }

    return new Date(Date.UTC(year, month-1, day));
  }
};

module.exports.DateParser = DateParser;