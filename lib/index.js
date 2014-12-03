var 3taps = (function (self) {
	'use strict';

	self = self || {};

	var defaultOptions = {
		apiKey : '',
		hosts : {
			polling : 'polling.3taps.com',
			reference : 'reference.3taps.com',
			search : 'search.3taps.com'
		},
		timeout : 10000 // 10 seconds
	};

	self.anchor = function (options, callback) {
		// polling.3taps.com/anchor
	};

	self.getCategories = function (options, callback) {
		// reference.3taps.com/categories
	};

	self.getCategoryGroups = function (options, callback) {
		// reference.3taps.com/category_groups
	};

	self.getDataSources = function (options, callback) {
		// reference.3taps.com/sources
	};

	self.getLocations = function (options, callback) {
		// reference.3taps.com/locations
	};

	self.lookupLocation = function (options, callback) {
		// reference.3taps.com/locations/lookup
	};

	self.poll = function (options, callback) {
		// polling.3taps.com/poll
	};

	self.search = function (options, callback) {
		// search.3taps.com
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
exports = module.exports = 3taps;
exports.initialize = 3taps;
