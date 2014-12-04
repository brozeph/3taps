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
			apikey : process.env.THREETAPS_APIKEY
		});
	});

	describe('polling', function () {
		var anchor;

		describe('#anchor', function () {
			it('should successsfully retrieve an anchor', function (done) {
				var options = { timestamp : new Date() };
				options.timestamp.setHours(options.timestamp.getHours() - 1); // an hour ago

				client.anchor(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.anchor);
					data.success.should.equal(true);

					// hang on to this for subsequent requests
					anchor = data.anchor;

					console.log(data);

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
					data.success.should.equal(true);

					return done();
				});
			});
		});
	});
});
