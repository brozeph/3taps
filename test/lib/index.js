/* jshint sub:true */

var
	// native
	querystring = require('querystring'),
	url = require('url'),

	// 3rd party
	chai = require('chai'),
	nock = require('nock'),

	// module globals
	should = chai.should(),
	threeTaps = require('../../lib');


// we haz teh tests!
describe('3taps', function () {
	'use strict';

	var
		client,
		defaultResponse = function (uri, body) {
			requestReply.request = {
				body : body,
				uri : uri
			};

			return requestReply;
		},
		requestQuery,
		requestReply,
		requestScope;

	function querystringFilter (path) {
		var destination = url.parse(path);

		// capture the query string params
		requestQuery.query = querystring.parse(destination.query);
		requestQuery.pathname = destination.pathname;

		// return the path without querystring
		return requestQuery.pathname;
	}

	// global pre-test hook
	beforeEach(function () {
		client = threeTaps({
			apikey : 'test-api-key'
		});

		requestQuery = {};
		requestReply = {
			success : true
		};
	});

	describe('constructor', function () {
		// test constructor
		it('should accept null or empty options', function() {
			client = threeTaps();

			should.exist(client);
			should.exist(client.options);
		});

		it('should default maxRetryCount to 3', function () {
			client = threeTaps();

			should.exist(client.options.maxRetryCount);
			client.options.maxRetryCount.should.equal(0);
		});

		it('should properly retry on failure', function (done) {
			requestScope = nock('https://polling.3taps.com')
				.filteringPath(querystringFilter)
				.get('/anchor')
				.times(2)
				.reply(409, { error : 'testing failure' })
				.get('/anchor')
				.reply(200, defaultResponse);

			client = threeTaps({ maxRetryCount : 2 });

			client.anchor(function (err, data) {
				should.exist(err);
				should.not.exist(data);

				should.exist(err.response);
				should.exist(err.response.error);
				err.response.error.should.equal('testing failure');

				client.anchor(function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});
	});

	// tests for the polling API
	describe('polling', function () {

		describe('#anchor', function () {
			// anchor pre-test hook
			beforeEach(function () {
				requestReply = {
					success : true,
					anchor : 12345
				};

				// setup HTTP request intercepts for polling
				requestScope = nock('https://polling.3taps.com')
					.filteringPath(querystringFilter)
					.get('/anchor')
					.reply(200, defaultResponse);
			});

			it('should accept no options', function (done) {
				client.anchor(function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});

			it('should request correct URL', function (done) {
				client.anchor({
					timestamp : new Date()
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});

			it('should coerce timestamp to seconds', function (done) {
				client.anchor({
					timestamp : new Date()
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					should.exist(requestQuery.query);
					should.exist(requestQuery.query.timestamp);
					requestQuery.query.timestamp.should.match(/^\d+$/, 'timestamp value is a number');

					return done();
				});
			});

			it('should properly handle HTTP error', function (done) {
				nock.cleanAll();
				requestScope = nock('https://polling.3taps.com')
					.filteringPath(querystringFilter)
					.get('/anchor')
					.reply(409, function (uri, body) {
						requestReply = {
							success : false,
							error : 'test error'
						};

						requestReply.request = {
							body : body,
							uri : uri
						};

						return requestReply;
					});

				client.anchor({
					timestamp : Date.now()
				}, function (err, data) {
					should.exist(err);
					should.not.exist(data);
					err.statusCode.should.equal(409);

					return done();
				});
			});

			it('should properly handle error in response', function (done) {
				nock.cleanAll();
				requestScope = nock('https://polling.3taps.com')
					.filteringPath(querystringFilter)
					.get('/anchor')
					.reply(200, function (uri, body) {
						requestReply = {
							success : false,
							error : 'test error'
						};

						requestReply.request = {
							body : body,
							uri : uri
						};

						return requestReply;
				});

				client.anchor({
					timestamp : Date.now()
				}, function (err, data) {
					should.exist(err);
					should.not.exist(data);
					err.statusCode.should.equal(200);
					should.exist(err.response);
					err.response.error.should.equal('test error');

					return done();
				});
			});
		});


		describe('#poll', function () {
			beforeEach(function () {
				// setup HTTP request intercepts for polling
				requestScope = nock('https://polling.3taps.com')
					.filteringPath(querystringFilter)
					.get('/poll')
					.reply(200, defaultResponse);
			});

			it('should accept no options', function (done) {
				client.poll(function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});

			it('should request correct URL', function (done) {
				client.poll({
					anchor : 12345
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});

			it('should accept retvals param as an array', function (done) {
				client.poll({
					retvals : ['one', 'two', 'three']
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					should.exist(requestQuery.query.retvals);
					requestQuery.query.retvals.should.equal('one,two,three');

					return done();
				});
			});

			it('should support location as sub-object', function (done) {
				client.poll({
					location : {
						city : 'test city',
						country : 'test country',
						county : 'test county',
						locality : 'test locality',
						metro : 'test metro',
						region : 'test region',
						state : 'test state',
						zipcode : 'test zip'
					}
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					should.exist(requestQuery.query['location.city']);
					should.exist(requestQuery.query['location.country']);
					should.exist(requestQuery.query['location.county']);
					should.exist(requestQuery.query['location.locality']);
					should.exist(requestQuery.query['location.metro']);
					should.exist(requestQuery.query['location.region']);
					should.exist(requestQuery.query['location.state']);
					should.exist(requestQuery.query['location.zipcode']);

					return done();
				});
			});

			it('should support all params', function (done) {
				client.poll({
					anchor : 12345,
					category : 'test category',
					'category_group' : 'test group',
					'location.city' : 'test city',
					'location.country' : 'test country',
					'location.county' : 'test county',
					'location.locality' : 'test locality',
					'location.metro' : 'test metro',
					'location.region' : 'test region',
					'location.state' : 'test state',
					'location.zipcode' : 'test zip',
					retvals : 'val1,val2,val3',
					source : 'test source',
					state : 'test state',
					status : 'test status'
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					should.exist(requestQuery.query);
					should.exist(requestQuery.query.anchor);
					should.exist(requestQuery.query.category);
					should.exist(requestQuery.query['category_group']);
					should.exist(requestQuery.query['location.city']);
					should.exist(requestQuery.query['location.country']);
					should.exist(requestQuery.query['location.county']);
					should.exist(requestQuery.query['location.locality']);
					should.exist(requestQuery.query['location.metro']);
					should.exist(requestQuery.query['location.region']);
					should.exist(requestQuery.query['location.state']);
					should.exist(requestQuery.query['location.zipcode']);
					should.exist(requestQuery.query.retvals);
					should.exist(requestQuery.query.source);
					should.exist(requestQuery.query.state);
					should.exist(requestQuery.query.status);

					return done();
				});
			});
		});
	});

	describe('reference', function () {
		describe('#getCategories', function () {
			beforeEach(function () {
				var replyHeaders = {
					'last-modified' : new Date()
				};

				// setup HTTP request intercepts for polling
				requestScope = nock('https://reference.3taps.com')
					.filteringPath(querystringFilter)
					.defaultReplyHeaders(replyHeaders)
					.get('/categories')
					.reply(200, defaultResponse);
			});

			it('should request correct URL', function (done) {
				client.getCategories(function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.lastModified);

					return done();
				});
			});
		});

		describe('#getCategoryGroups', function () {
			beforeEach(function () {
				var replyHeaders = {
					'last-modified' : new Date()
				};

				// setup HTTP request intercepts for polling
				requestScope = nock('https://reference.3taps.com')
					.filteringPath(querystringFilter)
					.defaultReplyHeaders(replyHeaders)
					.get('/category_groups')
					.reply(200, defaultResponse);
			});

			it('should request correct URL', function (done) {
				client.getCategoryGroups(function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.lastModified);

					return done();
				});
			});
		});

		describe('#getDataSources', function () {
			beforeEach(function () {
				var replyHeaders = {
					'last-modified' : new Date()
				};

				// setup HTTP request intercepts for polling
				requestScope = nock('https://reference.3taps.com')
					.filteringPath(querystringFilter)
					.defaultReplyHeaders(replyHeaders)
					.get('/sources')
					.reply(200, defaultResponse);
			});

			it('should request correct URL', function (done) {
				client.getDataSources(function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.lastModified);

					return done();
				});
			});
		});

		describe('#getLocations', function () {
			beforeEach(function () {
				var replyHeaders = {
					'last-modified' : new Date()
				};

				// setup HTTP request intercepts for polling
				requestScope = nock('https://reference.3taps.com')
					.filteringPath(querystringFilter)
					.defaultReplyHeaders(replyHeaders)
					.get('/locations')
					.reply(200, defaultResponse);
			});

			it('should request correct URL', function (done) {
				client.getLocations(function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.lastModified);

					return done();
				});
			});

			it('should support all params', function (done) {
				client.getLocations({
					city : 'test city',
					country : 'test country',
					county : 'test county',
					locality : 'test locality',
					metro : 'test metro',
					region : 'test region',
					state : 'test state',
					zipcode : 'test zipcode'
				}, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					should.exist(requestQuery.query);
					should.exist(requestQuery.query.city);
					should.exist(requestQuery.query.country);
					should.exist(requestQuery.query.county);
					should.exist(requestQuery.query.locality);
					should.exist(requestQuery.query.metro);
					should.exist(requestQuery.query.region);
					should.exist(requestQuery.query.state);
					should.exist(requestQuery.query.zipcode);

					return done();
				});
			});
		});

		describe('#lookupLocation', function () {
			beforeEach(function () {
				var replyHeaders = {
					'last-modified' : new Date()
				};

				// setup HTTP request intercepts for polling
				requestScope = nock('https://reference.3taps.com')
					.filteringPath(querystringFilter)
					.defaultReplyHeaders(replyHeaders)
					.get('/locations/lookup')
					.reply(200, defaultResponse);
			});

			it('should request correct URL', function (done) {
				client.lookupLocation(function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.lastModified);

					return done();
				});
			});
		});
	});

	describe('search', function () {
		beforeEach(function () {
			// setup HTTP request intercepts for polling
			requestScope = nock('https://search.3taps.com')
				.filteringPath(querystringFilter)
				.get('/')
				.reply(200, defaultResponse);
		});

		it('should request correct URL', function (done) {
			var options = {};
			client.search(options, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
		});

		it('should search without options', function (done) {
			client.search(function (err, data) {
				should.not.exist(err);
				should.exist(data);

				return done();
			});
		});

		it('should accept retvals param as an array', function (done) {
			client.search({
				retvals : ['one', 'two', 'three']
			}, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.exist(requestQuery.query.retvals);
				requestQuery.query.retvals.should.equal('one,two,three');

				return done();
			});
		});

		it('should support location as sub-object', function (done) {
			client.search({
				location : {
					city : 'test city',
					country : 'test country',
					county : 'test county',
					locality : 'test locality',
					metro : 'test metro',
					region : 'test region',
					state : 'test state',
					zipcode : 'test zip'
				}
			}, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.exist(requestQuery.query['location.city']);
				should.exist(requestQuery.query['location.country']);
				should.exist(requestQuery.query['location.county']);
				should.exist(requestQuery.query['location.locality']);
				should.exist(requestQuery.query['location.metro']);
				should.exist(requestQuery.query['location.region']);
				should.exist(requestQuery.query['location.state']);
				should.exist(requestQuery.query['location.zipcode']);

				return done();
			});
		});

		it('should support all params', function (done) {
			client.search({
				category : 'test category',
				'category_group' : 'test group',
				'location.city' : 'test city',
				'location.country' : 'test country',
				'location.county' : 'test county',
				'location.locality' : 'test locality',
				'location.metro' : 'test metro',
				'location.region' : 'test region',
				'location.state' : 'test state',
				'location.zipcode' : 'test zipcode',
				source : 'test source',

				lat : 100,
				long : 100,
				radius : 5,

				annotations : 'test annotation',
				body : 'test body',
				currency : 'test currency',
				'external_id' : 'test id',
				'has_image' : true,
				'has_price' : true,
				heading : 'test',
				id : 1234,
				'include_deleted' : true,
				'only_deleted' : true,
				price : '100.00',
				state : 'test',
				status : 'test',
				text : 'test',
				timestamp : 'test',

				anchor : 12345,
				count : 10,
				page : 1,
				retvals : 'one,two,three',
				rpp : 50,
				sort : 'test',
				tier : 1
			}, function (err, data) {
				should.not.exist(err);
				should.exist(data);

				should.exist(requestQuery.query);

				should.exist(requestQuery.query.category);
				should.exist(requestQuery.query['category_group']);
				should.exist(requestQuery.query['location.city']);
				should.exist(requestQuery.query['location.country']);
				should.exist(requestQuery.query['location.county']);
				should.exist(requestQuery.query['location.locality']);
				should.exist(requestQuery.query['location.metro']);
				should.exist(requestQuery.query['location.region']);
				should.exist(requestQuery.query['location.state']);
				should.exist(requestQuery.query['location.zipcode']);
				should.exist(requestQuery.query.source);

				should.exist(requestQuery.query.lat);
				should.exist(requestQuery.query.long);
				should.exist(requestQuery.query.radius);

				should.exist(requestQuery.query.annotations);
				should.exist(requestQuery.query.body);
				should.exist(requestQuery.query.currency);
				should.exist(requestQuery.query['external_id']);
				should.exist(requestQuery.query['has_image']);
				should.exist(requestQuery.query['has_price']);
				should.exist(requestQuery.query.heading);
				should.exist(requestQuery.query.id);
				should.exist(requestQuery.query['include_deleted']);
				should.exist(requestQuery.query['only_deleted']);
				should.exist(requestQuery.query.price);
				should.exist(requestQuery.query.state);
				should.exist(requestQuery.query.status);
				should.exist(requestQuery.query.text);
				should.exist(requestQuery.query.timestamp);

				should.exist(requestQuery.query.anchor);
				should.exist(requestQuery.query.count);
				should.exist(requestQuery.query.page);
				should.exist(requestQuery.query.retvals);
				should.exist(requestQuery.query.rpp);
				should.exist(requestQuery.query.sort);
				should.exist(requestQuery.query.tier);

				return done();
			});
		});
	});
});
