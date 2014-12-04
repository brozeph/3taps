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
		anchorReply,
		client,
		requestQuery;

	function querystringFilter (path) {
		var destination = url.parse(path);

		// capture the query string params
		requestQuery.query = querystring.parse(destination.query);
		requestQuery.pathname = destination.pathname;

		// return the path without querystring
		return requestQuery.pathname;
	}

	beforeEach(function () {
		anchorReply = {
			success : true,
			anchor : 12345
		};

		client = threeTaps({
			apikey : 'test-api-key'
		});

		requestQuery = {};
	});

	// setup scopes for request intercepts
	nock('https://polling.3taps.com')
		.persist()
		.filteringPath(querystringFilter)
		.get('/anchor')
		.reply(200, function (uri, body) {
			anchorReply.request = {
				body : body,
				uri : uri
			};

			return anchorReply;
		});

	// tests for the polling API
	describe('polling', function () {
		describe('#anchor', function () {
			it('should request correct URL', function (done) {
				client.anchor({
					timestamp : Date.now()
				}, function () {
					should.exist(requestQuery.pathname);
					requestQuery.pathname.should.equal('/anchor');

					return done();
				});
			});

			it('should coerce timestamp to seconds', function (done) {
				client.anchor({
					timestamp : Date.now()
				}, function (err) {
					should.not.exist(err);
					should.exist(requestQuery.query);
					should.exist(requestQuery.query.timestamp);
					requestQuery.query.timestamp.should.match(/^\d+$/, 'timestamp value is a number');

					return done();
				});
			});
		});
	});
});
