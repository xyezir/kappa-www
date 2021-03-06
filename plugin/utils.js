'use strict';

var path = require('path');
var _ = require('underscore');
var config = require('../config');

var whitelistedKeys = [
  'name',
  'description',
  'maintainers',
  'keywords',
  'repository',
  'author'
];

var utils = {

  isNonNPMClientBasedRequest: function(req) {
    return req.headers['user-agent'] &&
      req.headers['user-agent'].indexOf('npm/') === -1;
  },

  isXHRRequest: function(req) {
    return (req.headers['x-requested-with'] === 'XMLHttpRequest');
  },

  isAssetRequest: function(req) {
    return req.path.indexOf(config.directory.asset + '/') !== -1;
  },

  isPlainResponse: function(req) {
    return (req.response.variety && req.response.variety === 'plain');
  }
};

module.exports = {

  packageCleaner: function(packages) {
    // some packages seem to have _id attribute.
    // remove those, beacuse it conflicts with
    // nedb needing that _id to store packages
    // into the local db.
    var filteredPackages = [];
    packages.forEach(function(pkg) {
      if (pkg._id) {
        delete pkg._id;
      }
      // get only objects.
      // npm response returns
      // timestamps also in the
      // response. we ignore that.
      if (typeof pkg === 'object') {
        // pick only the whitelisted attributes
        // from the couch document object.
        filteredPackages.push(_.pick(pkg, whitelistedKeys));
      }
    });

    return filteredPackages;
  },

  shouldRenderHtml: function(req) {
    return utils.isNonNPMClientBasedRequest(req) &&
      !utils.isAssetRequest(req);
  },

  isSearchRequest: function(req) {
    return utils.isXHRRequest(req) &&
      req.url.pathname.indexOf(config.search.url) !== -1;
  },

  searchKeyFromRequest: function(req) {
    return decodeURIComponent(req.url.pathname.split('/').pop());
  },

  assestRoute: '/'  + config.directory.asset + '/{path*}',

  assestPath: path.normalize(__dirname + '/../' + config.directory.asset),

  layoutFile: config.layoutFile,

  viewPath: path.normalize(__dirname + '/../' + config.directory.asset + '/' + config.directory.template)
};
