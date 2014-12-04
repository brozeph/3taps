# 3taps API Node Client

This is an API client for the 3taps polling, reference and search API endpoints.

## Getting Started

Not deployed yet to NPM... intend to publish as an npm module for simple inclusion in various projects.

Until then, this library can be included and used via a git link in the dependencies section of the `package.json` file:

```
"dependencies": [
	"3taps" : "git://bitbucket.org/hashtagsell/3taps.git#master"
]
```

### Polling API

#### Anchor

```
var threeTapsClient = require('3taps')({ apikey : 'my-api-key' });

threeTapsClient.anchor({
  timestamp : new Date()
}, function (err, data) {
  // work with data here
});
```

For which the response will look similar to the following:

```
{
  success: true,
  anchor: 1570197959
}
```

#### Poll

```
var threeTapsClient = require('3taps')({ apikey : 'my-api-key' });

threeTapsClient.anchor({
  timestamp : new Date()
}, function (err, data) {
  // work with data here
});
```

The library will respond with something similar to:

```
{
  success: true,
  anchor: 124981255,
  postings: [
  { id: 1570150577,
    source: 'CRAIG',
    category: 'RHFS',
    external_id: '4757959490',
    external_url: 'http://greensboro.craigslist.org/reb/4757959490.html',
    heading: '6312 Settlement Road',
    timestamp: 1417712270,
    annotations: [Object],
    deleted: false,
    location: [Object] },
  { id: 1570150578,
    source: 'CRAIG',
    category: 'JMFT',
    external_id: '4759338172',
    external_url: 'http://fredericksburg.craigslist.org/mnu/4759338172.html',
    heading: 'QA Technician',
    timestamp: 1417711983,
    annotations: [Object],
    deleted: false,
    location: [Object] },
  // and so on...
  ]
}
```

## Development

### Running Tests

The `package.json` file is wired up to run jshint, unit tests and code coverage reporting, but not functional tests when running `npm test`.

```
npm test
```

#### Unit Tests

```
gulp jshint
```

#### Unit Tests

```
gulp test-unit
```

#### Test Coverage

When running test coverage, an istanbul report will be created at `./reports/lcov-report/lib/index.js.html`

```
gulp test-coverage
open reports/lcov-report/lib/index.js.html
```

#### Functional Tests

To run functional tests, you'll need to export an environment variable with your 3taps API key:

```
export THREETAPS_APIKEY=my-key-goes-here
```

To verify whether your key is properly set, simply echo from the command line:

```
echo $THREETAPS_APIKEY
```

_note: You may want to consider adding this to your ~/.bash_profile so that it is always set when you open a terminal_

Now, you can run the functional tests using gulp with the following command:

```
gulp test-functional
```
