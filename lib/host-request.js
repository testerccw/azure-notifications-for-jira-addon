var util = require('util');
var request = require('request');
var config = require('nconf');
var _ = require('lodash');
var moment = require('moment');
var jwt = require('atlassian-jwt');
var URI = require('urijs');
var debug = require('debug')('azure-notifications-addon:host-request');

function HostClient (clientSettings) {
  this.clientSettings = clientSettings;
  return this;
}

HostClient.prototype.defaults = function (options) {
  return request.defaults.apply(null, this.modifyArgs(options));
};

HostClient.prototype.cookie = function () {
    return request.cookie.apply(null, arguments);
};

HostClient.prototype.jar = function () {
    return request.jar();
};

HostClient.prototype.modifyArgs = function (options, augmentHeaders, callback, hostBaseUrl) {
  var args = [];

  if (_.isString(options)) {
    options = {uri: options};
  }
  if (options.url) {
    options.uri = options.url;
    delete options.url;
  }

  var originalUri = options.uri;
  var targetUri = new URI(originalUri);
  var hostBaseUri = new URI(hostBaseUrl);

  if (!targetUri.origin()) {
    targetUri.origin(hostBaseUri.origin());
    var newPath = URI.joinPaths(hostBaseUri.path(), targetUri.path());
    targetUri.path(newPath.path());
  }

  options.uri = targetUri.toString();
  args.push(options);

  if (targetUri.origin() === hostBaseUri.origin()) {
    if (!options.headers) {
      options.headers = {};
    }

    if (augmentHeaders) {
      augmentHeaders(options.headers, originalUri);
    }

    options.jar = false;
  }

  if (callback) {
    args.push(callback);
  }

  return args;
};

HostClient.prototype.createJwtPayload = function (req) {
  var now = moment().utc();
  var jwtTokenValidityInMinutes = config.get('addOn:jwt:validityInMinutes');

  var token = {
    "iss": config.get('addOn:appKey'),
    "iat": now.unix(),
    "exp": now.add(jwtTokenValidityInMinutes, 'minutes').unix(),
    "qsh": jwt.createQueryStringHash(req),
    "aud": [ this.clientSettings.clientKey ]
  };

  return token;
};

['get', 'post', 'put', 'del', 'head', 'patch'].forEach(function (method) {

  HostClient.prototype[method] = function (options, callback) {
    var self = this;

    var augmentHeaders = function (headers, relativeUri) {
      var uri = new URI(relativeUri);
      var query = uri.search(true);

      var httpMethod = method === 'del' ? 'delete' : method;
      var jwtPayload = self.createJwtPayload({
        'method': httpMethod,
        'path'  : uri.path(),
        'query' : query
      });
      var jwtToken = jwt.encode(jwtPayload, self.clientSettings.sharedSecret, 'HS256');

      headers['Authorization'] = "JWT " + jwtToken;

      var appKey = config.get('addOn:appKey');
      var appVersion = config.get('addOn:appVersion')
      headers['User-Agent'] = appKey + "/" + appVersion;
    };
    debug('self.clientSettings.baseUrl:' + self.clientSettings.baseUrl);
    debug('self.clientSettings:' + util.inspect(self.clientSettings));
    var args = self.modifyArgs(options, augmentHeaders, callback, self.clientSettings.baseUrl);

    var multipartFormData = options.multipartFormData;
    delete options.multipartFormData;

    var _request = request[method].apply(null, args);

    if (multipartFormData) {
      var form = _request.form();

      _.forOwn(multipartFormData, function(value, key){
        if (Array.isArray(value)) {
          form.append.apply(form, [key].concat(value));
        }
        else {
          form.append.apply(form, [key, value]);
        }
      });
    }

    debug(util.inspect(_request.headers));
    debug(util.inspect(_request.body));

    return _request;
  }
});

module.exports = HostClient;
