var path = require('path');
var nconf = require('nconf');
var debug = require('debug')('azure-notifications-addon:config');

var environment = process.env.NODE_ENV
environment ? environment.trim() : "production"

nconf.env({ separator: '_' })
     .file({ file: environment + '-config.json' });

debug('Intialising configuration ...');
debug('Configuration will be loaded from the following sources in order:');
debug('1. Load config from environment variables.');
debug('2. Load config from config file:' + path.join(nconf.stores.file.dir, nconf.stores.file.file) + '.' );