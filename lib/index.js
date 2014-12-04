var request = require('request');


var threeTaps = (function (self) {
	'use strict';

	self = self || {};

	var defaultOptions = {
		apikey : '',
		pollingUrl : 'https://polling.3taps.com',
		referenceUrl : 'https://reference.3taps.com',
		searchUrl : 'https://search.3taps.com',
		timeout : 10000 // 10 seconds
	};

	function checkResponseForError (requestOptions, res, json) {
		var err;

		// check for bad HTTP response
		if (res.statusCode > 299 || res.statusCode < 200) {
			err = new Error((json ? json.error : null) || 'unexpected response from server');
			err.params = requestOptions.query;
			err.response = json ? (json.error || json.response) : '';
			err.statusCode = res.statusCode;
			err.url = requestOptions.url;
		}

		// check for error in payload
		if (json && typeof json.error !== 'undefined') {
			err = new Error(json.error);
			err.params = requestOptions.query;
			err.response = json.response;
			err.statusCode = res.statusCode;
			err.url = requestOptions.url;
		}

		return err;
	}

	function getParam (paramName, options) {
		return options[paramName] || self.options[paramName];
	}

	function tryParseJSON (body) {
		if (typeof body === 'object') {
			return body;
		}

		try {
			return JSON.parse(body);
		} catch (ex) {
			return null;
		}
	}

	self.anchor = function (options, callback) {
		// polling.3taps.com/anchor
		var
			json = {},
			requestOptions = {
				method : 'GET',
				qs : {
					'auth_token' : getParam('apikey', options),
					timestamp : getParam('timestamp', options)
				},
				url : [getParam('pollingUrl', options), 'anchor'].join('/')
			};

		// coerce timestamp value to seconds if supplied as Date
		if (typeof requestOptions.qs.timestamp !== 'undefined' &&
			requestOptions.qs.timestamp instanceof Date) {
			requestOptions.qs.timestamp =
				Math.floor(Number(requestOptions.qs.timestamp) / 1000);
		}

		// make request
		request(requestOptions, function (err, res, body) {
			// attempt to parse response as JSON
			json = tryParseJSON(body);
			if (!json) {
				json = {
					response : body
				};
			}

			// check for error
			err = err || checkResponseForError(requestOptions, res, json);
			if (err) {
				return callback(err);
			}

			// all good
			return callback(null, json);
		});
	};

	self.getCategories = function (options, callback) {
		// reference.3taps.com/categories
		return setImmediate(callback, new Error('not implemented'));
	};

	self.getCategoryGroups = function (options, callback) {
		// reference.3taps.com/category_groups
		return setImmediate(callback, new Error('not implemented'));
	};

	self.getDataSources = function (options, callback) {
		// reference.3taps.com/sources
		return setImmediate(callback, new Error('not implemented'));
	};

	self.getLocations = function (options, callback) {
		// reference.3taps.com/locations
		return setImmediate(callback, new Error('not implemented'));
	};

	self.lookupLocation = function (options, callback) {
		// reference.3taps.com/locations/lookup
		return setImmediate(callback, new Error('not implemented'));
	};

	self.poll = function (options, callback) {
		// polling.3taps.com/poll
		return setImmediate(callback, new Error('not implemented'));
	};

	self.search = function (options, callback) {
		// search.3taps.com
		return setImmediate(callback, new Error('not implemented'));
	};

	// initialize
	return function (options) {
		options = options || {};

		// apply default values for any missing keys in options
		Object.keys(defaultOptions).forEach(function (key) {
			if (typeof options[key] === 'undefined') {
				options[key] = defaultOptions[key];
			}
		});

		self.options = options;

		return self;
	};
}({}));

// exports
exports = module.exports = threeTaps;
exports.initialize = threeTaps;
