# GNATS parser

If you are unfortunate enough to be working with a GNATS bug tracking system, this module will help you convert raw text to JSON objects.

### Install

```
$ npm install gnats
```

### Use

```js
var gnats = require('gnats');

// From string
var pr = gnats.parse(pr_text);

// From file
gnats.fetch('31337.txt', function (err, pr_text) {
    var pr = gnats.parse(pr_text);
});

// From URL (same as file)
gnats.fetch('http://www.example.com/gnats/31337', function (err, pr_text) {
    var pr = gnats.parse(pr_text);
});
```
