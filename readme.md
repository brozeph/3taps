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

### General Reference

#### Errors

In the event that the 3taps API returns an unsupported HTTP status code (i.e. less than 200 or greater than 299) *or* when the `success` field from the return message is `false`, the callback will contain an error with the following properties:

```
{
  requestOptions: {
    method: 'GET',
    qs: { auth_token: 'test-api-key', timestamp: 1417789575187 },
    url: 'https://polling.3taps.com/anchor'
  },
  response: {
    success: false,
    error: 'example error',
    request: {
      body: '',
      uri: '/anchor?auth_token=test-api-key&timestamp=1417789575187'
    }
  },
  statusCode: 409
}
```

#### Options

Options are optional for every method call... the underlying 3taps API may return an error in the event that an expected parameter is missing, however. All parameters can be specified globally when initializing the client library and each initialized parameter value can be overridden in each module method call.

### Polling API

The polling endpoint supports two specific capabilities: `anchor` and `poll`

#### Anchor

Use this to generate an anchor from a point in time... the timestamp value is supported as a Date value or the number of seconds from Unix epoch (January 1, 1970).

```
var
  anchorDate = new Date(),
  threeTapsClient = require('3taps')({ apikey : 'my-api-key' });

// retrieve all postings new in the last hour
anchorDate.setHours(anchorDate.getHours() - 1);

threeTapsClient.anchor({
  timestamp : anchorDate
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

threeTapsClient.poll({
  anchor : 1570197959
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

##### Polling Options

Polling supports a series of parameters that can be passed in the `options` argument. For a full reference, please see the 3taps documentaiton at <http://docs.3taps.com/polling_api.html>. Additionally, many of the params support the ability to pass in the logical operators `|` (or) and `-` (not).

Here is an example list of options:

```
var options = {
  anchor : 12345, // optional
  category : '', // optional - 3taps category code, supports logical operators
  'category_group' : '', // optional - 3taps category_group code, supports logical operators
  city : '', // optional - desired City, supports logical operators
  country : '', // optional - desired Country code, supports logical operators
  locality : '', // optional - 3taps Locality code, supports logical operators
  metro : '', // optional - 3taps Metro Area code, supports logical operators
  region : '', // optional - 3taps Region code, supports logical operators
  retvals : '', // optional - list of fields to return (see below)
  source : '', // optional - 3taps Data Source code, supports logical operators
  state : '', // optional - state of the posting (see below), supports logical operators
  status : '', // optional - status of the posting (see below), supports logical operators
  zipcode : '' // optional - desired Zip Code, supports logical operators
};

threeTapsClient.poll(options, function (err, data) {
  // filtered awesomeness in the data arg
});
```

###### retvals

The retvals parameter supports a comma separated list of values from the following:

* id
* account_id
* source
* category
* category_group
* location
* external_id
* external_url
* heading
* body
* timestamp
* timestamp_deleted
* expires
* language
* price
* currency
* images
* annotations
* status
* state
* immortal
* deleted
* flagged_status

###### state

The state parameter supports the following values:

* available
* unavailable
* expired

###### status

The status parameter supports the following values:

* registered
* for_sale
* for_hire
* for_rent
* wanted
* lost
* stolen
* found

### Reference API



### Search API



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
