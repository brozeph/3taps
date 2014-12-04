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
	this.timeout(10000);

	var client;

	beforeEach(function () {
		client = threeTaps({
			apikey : process.env.THREETAPS_APIKEY
		});
	});

	describe('polling', function () {
		describe('#anchor', function () {
			it('should successsfully retrieve an anchor', function (done) {
				var options = { timestamp : new Date() };
				options.timestamp.setDate(options.timestamp.getDate() - 1); // yesterday

				client.anchor(options, function (err, data) {
					should.not.exist(err);
					should.exist(data);
					should.exist(data.anchor);

					return done();
				});
			});
		});
	});
});
