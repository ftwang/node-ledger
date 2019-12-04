var _ = require('lodash'),
    spawn = require('child_process').spawn;

var Cli = (function() {
  function Cli(command, options) {
    this.command = command;
    this.options = _.defaults({}, options, { debug: false });
  }
  
  Cli.prototype.exec = function(args) {
    var process = this.spawn(args);

    if (this.options.debug) {
      this.logging(process);
    }
    
    return process;
  };
  
  Cli.prototype.spawn = function(args) {
    this.log(this.command + ' ' + args.join(' '));

    var process = spawn(this.command, args);

    // pass string into stdin via /dev/stdin
    if (this.options.string) {
      process.stdin.write(this.options.string);
      process.stdin.end();
    }

    process.stdout.setEncoding('utf8');
    process.stderr.setEncoding('utf8');
    
    process.stderr.on('data', function(error) { process.stdout.emit("error", error); });

    return process;
  };
  
  Cli.prototype.logging = function(process) {
    var log = this.log.bind(this);
    
    process.stdout.on('data', function(data) { log('stdout: \r\n' + data); });
    process.stderr.on('data', function(error) { log('stderr: \r\n'+ error); });
    process.once('close', function(code) { log('child process exited with code ' + code); });
  };
  
  Cli.prototype.log = function(msg) {
    if (this.options.debug) {
      console.log(msg);
    }
  };
  
  return Cli;
})();

module.exports.Cli = Cli;