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
	});

	// tests for the polling API
	describe('polling', function () {
		// polling pre-test hook
		beforeEach(function () {
			// setup HTTP request intercepts for polling
			requestScope = nock('https://polling.3taps.com')
				.filteringPath(querystringFilter)
				.get('/anchor')
				.reply(200, defaultResponse);
		});

		describe('#anchor', function () {
			// anchor pre-test hook
			beforeEach(function () {
				requestReply = {
					success : true,
					anchor : 12345
				};
			});

			it('should request correct URL', function (done) {
				client.anchor({
					timestamp : new Date()
				}, function () {
					should.exist(requestQuery.pathname);
					requestQuery.pathname.should.equal('/anchor');

					return done();
				});
			});

			it('should coerce timestamp to seconds', function (done) {
				client.anchor({
					timestamp : new Date()
				}, function (err) {
					should.not.exist(err);
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
			// poll pre-test hook
			beforeEach(function () {
				requestReply = {
					success : true
				};
			});

			it('should request correct URL', function (done) {
				client.poll({
					anchor : 12345
				}, function () {
					should.exist(requestQuery.pathname);
					requestQuery.pathname.should.equal('/poll');

					return done();
				});
			});

			it('should support anchor and source params', function (done) {
				client.poll({
					anchor : 12345,
					source : 'test-source'
				}, function () {
					should.exist(requestQuery.pathname);
					requestQuery.pathname.should.equal('/poll');
					should.exist(requestQuery.query.anchor);
					should.exist(requestQuery.query.source);

					return done();
				});
			});
		});
	});
});
