module.exports.run = function(cli, callback) {
  var process = cli.exec(['stats']);

  var data = '';
  var errorMessage = '';
  var errored = false;

  process.stdout.on('data', function(chunk) {
    data += chunk;
  });

  process.stdout.once('end', function() {
    if (errored) {
      callback(errorMessage);
    }
    var stats = null,
        split = data.toString().split('\n'),
        files = data.match(/Files these postings came from:([^]*?)(\r?\n){2}/);

    split.forEach(function(el){
      var prop = el.trim().match(/^(.*):[\s]+(.*)$/);
      if (prop) {
       if (stats === null) {
         stats = {};
       }
       stats[prop[1]] = prop[2];
      }
    });

    if (files) {
      if (stats === null) {
        stats = {};
      }

      // convert files[1] == paths capture to array and remove empty entries
      stats.files = files[1].split('\n').map(function(entry) {
        return entry.trim();
      }).filter(Boolean);
    }

    if (stats !== null) {
      callback(null, stats);
    } else {
      callback('Failed to parse Ledger stats');
    }
  });

  process.stdout.on('error', function (error) {
    errored = true;
    errorMessage += error;
  });
};
