var request = require('request');


var threeTaps = (function (self) {
	'use strict';

	self = self || {};

	var defaultOptions = {
		apikey : '',
		pollingUrl : 'https://polling.3taps.com',
		referenceUrl : 'https://reference.3taps.com',
		searchUrl : 'https://search.3taps.com',
		strictSSL : true,
		timeout : 10000 // 10 seconds
	};

	function checkResponseForError (requestOptions, res, json) {
		var err;

		// check for bad HTTP response or error in response
		if (res.statusCode > 299 || res.statusCode < 200) {
			err = new Error((json ? json.error : null) || 'unexpected response from server');

			err.requestOptions = requestOptions;
			err.response = json;
			err.statusCode = res.statusCode;
		} else if (json && typeof json.error !== 'undefined') {
			err = new Error(json.error);

			err.requestOptions = requestOptions;
			err.response = json;
			err.statusCode = res.statusCode;
		}

		return err;
	}

	function getParam (paramName, options) {
		return options[paramName] || self.options[paramName];
	}

	function makeRequest (requestOptions, callback) {
		// make request
		request(requestOptions, function (err, res, body) {
			// attempt to parse response as JSON
			var json = tryParseJSON(body);
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

			// all good... return the body and the response headers
			return callback(null, json, res.headers || {});
		});
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

	function wrapCallback (callback) {
		return function (err, json, headers) {
			// check for teh errors
			if (err) {
				return callback(err);
			}

			// assign last-modified header value to response
			// this is handy specifically for reference API calls...
			if (typeof headers['last-modified'] !== 'undefined') {
				json.lastModified = new Date(headers['last-modified']);
			}

			return callback(null, json);
		};
	}

	self.anchor = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// polling.3taps.com/anchor
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options),
				timestamp : getParam('timestamp', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [getParam('pollingUrl', options), 'anchor'].join('/')
		};

		// coerce timestamp value to seconds if supplied as Date
		if (typeof requestOptions.qs.timestamp !== 'undefined' &&
			requestOptions.qs.timestamp instanceof Date) {
			requestOptions.qs.timestamp =
				Math.floor(Number(requestOptions.qs.timestamp) / 1000);
		}

		// make request
		makeRequest(requestOptions, callback);
	};

	self.getCategories = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// reference.3taps.com/categories
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [getParam('referenceUrl', options), 'categories'].join('/')
		};

		// make request
		makeRequest(requestOptions, wrapCallback(callback));
	};

	self.getCategoryGroups = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// reference.3taps.com/category_groups
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [getParam('referenceUrl', options), 'category_groups'].join('/')
		};

		// make request
		makeRequest(requestOptions, wrapCallback(callback));
	};

	self.getDataSources = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// reference.3taps.com/sources
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [getParam('referenceUrl', options), 'sources'].join('/')
		};

		// make request
		makeRequest(requestOptions, wrapCallback(callback));
	};

	self.getLocations = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// reference.3taps.com/locations
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options),
				city : getParam('city', options),
				country : getParam('country', options),
				county : getParam('county', options),
				level : getParam('level', options),
				locality : getParam('locality', options),
				metro : getParam('metro', options),
				region : getParam('region', options),
				state : getParam('state', options),
				zipcode : getParam('zipcode', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [getParam('referenceUrl', options), 'locations'].join('/')
		};

		// make request
		makeRequest(requestOptions, wrapCallback(callback));
	};

	self.lookupLocation = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// reference.3taps.com/locations/lookup
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options),
				code : getParam('code', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [
				getParam('referenceUrl', options),
				'locations',
				'lookup'].join('/')
		};

		// make request
		makeRequest(requestOptions, wrapCallback(callback));
	};

	self.poll = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// polling.3taps.com/poll
		var requestOptions = {
			method : 'GET',
			qs : {
				anchor : getParam('anchor', options),
				'auth_token' : getParam('apikey', options),
				category : getParam('category', options),
				'category_group' : getParam('category_group', options),
				'location.city' : getParam('location.city', options),
				'location.country' : getParam('location.country', options),
				'location.county' : getParam('location.county', options),
				'location.locality' : getParam('location.locality', options),
				'location.metro' : getParam('location.metro', options),
				'location.region' : getParam('location.region', options),
				'location.state' : getParam('location.state', options),
				'location.zipcode' : getParam('location.zipcode', options),
				retvals : getParam('retvals', options),
				source : getParam('source', options),
				state : getParam('state', options),
				status : getParam('status', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : [getParam('pollingUrl', options), 'poll'].join('/')
		};

		// make request
		makeRequest(requestOptions, callback);
	};

	self.search = function (options, callback) {
		// verify input parameters
		if (typeof callback === 'undefined' && typeof options === 'function') {
			callback = options;
			options = {};
		}

		// search.3taps.com
		var requestOptions = {
			method : 'GET',
			qs : {
				'auth_token' : getParam('apikey', options),

				// references params
				category : getParam('category', options),
				'category_group' : getParam('category_group', options),
				'location.city' : getParam('location.city', options),
				'location.country' : getParam('location.country', options),
				'location.county' : getParam('location.county', options),
				'location.locality' : getParam('location.locality', options),
				'location.metro' : getParam('location.metro', options),
				'location.region' : getParam('location.region', options),
				'location.state' : getParam('location.state', options),
				'location.zipcode' : getParam('location.zipcode', options),
				source : getParam('source', options),

				// geo params
				lat : getParam('lat', options),
				long : getParam('long', options),
				radius : getParam('radius', options),

				// posting specific
				annotations : getParam('annotations', options),
				body : getParam('body', options),
				currency : getParam('currency', options),
				'external_id' : getParam('external_id', options),
				'has_image' : getParam('has_image', options),
				'has_price' : getParam('has_price', options),
				heading : getParam('heading', options),
				id : getParam('id', options),
				'include_deleted' : getParam('include_deleted', options),
				'only_deleted' : getParam('only_deleted', options),
				price : getParam('price', options),
				state : getParam('state', options),
				status : getParam('status', options),
				text : getParam('text', options),
				timestamp : getParam('timestamp', options),

				// shaping and paging
				anchor : getParam('anchor', options),
				count : getParam('count', options),
				page : getParam('page', options),
				retvals : getParam('retvals', options),
				rpp : getParam('rpp', options),
				sort : getParam('sort', options),
				tier : getParam('tier', options)
			},
			strictSSL : getParam('strictSSL', options),
			url : getParam('searchUrl', options)
		};

		// make request
		makeRequest(requestOptions, callback);
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
