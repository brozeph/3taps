var
	// 3rd party
	chai = require('chai'),

	// module globals
	should = chai.should(),
	threeTaps = require('../../lib');


// we haz teh tests!
describe('3taps', function () {
	'use strict';

	// increase timeout
	this.timeout(20000);

	var client;

	beforeEach(function () {
		client = threeTaps({
			apikey : process.env.THREETAPS_APIKEY,
			strictSSL : false
		});
	});

	describe('polling', function () {
		var anchor;

		describe('#anchor', function () {
			it('should successsfully retrieve an anchor', function (done) {
				var options = { timestamp : new Date() };
				options.timestamp.setSeconds(options.timestamp.getSeconds() - 60); // a minute ago

				client.anchor(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.anchor);
					data.success.should.equal(true);

					// hang on to this for subsequent requests
					anchor = data.anchor;

					return done();
				});
			});
		});

		describe('#poll', function () {
			it('should successsfully retrieve an anchor', function (done) {
				var options = { anchor : anchor };

				client.poll(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});
	});

	describe('reference', function () {
		var locationCode;

		describe('#getCategories', function () {
			it('should successfully retrieve categories', function (done) {
				client.getCategories(function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});

		describe('#getCategoryGroups', function () {
			it('should successfully retrieve category groups', function (done) {
				client.getCategoryGroups(function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});

		describe('#getDataSources', function () {
			it('should successfully retrieve data sources', function (done) {
				client.getDataSources(function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});

		describe('#getLocations', function () {
			it('should successfully retrieve locations', function (done) {
				var options = {
					level : 'zipcode',
					city : 'USA-SFO-SNF'
				};

				client.getLocations(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					locationCode = data.locations[0].code;

					return done();
				});
			});
		});

		describe('#lookupLocation', function () {
			it('should successfully retrieve location detail', function (done) {
				var options = {
					code : locationCode
				};

				client.lookupLocation(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});
	});

	describe('search', function () {
		describe('#search', function () {
			it('should successfully search', function (done) {
				var options = {
					'location.city' : 'USA-SFO-SNF',
					body : 'fixie'
				};

				client.search(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);

					return done();
				});
			});
		});
	});
});
