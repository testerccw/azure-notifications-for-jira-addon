var fs = require('fs');
var path = require('path');
var debug = require('debug')('azure-notifications-addon:routes');

module.exports = function(app) {
  fs.readdirSync(__dirname).forEach(function(file) {
    if (file === "index.js") return;
    if (path.extname(file) != ".js") return;
    
    var routes = require("./" + path.basename(file));
    if (typeof routes === "function") {
      routes(app);
    }
  });
}