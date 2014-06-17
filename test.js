var async = require('async'),
    fs = require('fs'),
    gnats = require('./gnats');

var config = {
	url: 'http://gnats.netbsd.org/',
};

function main() {
	var input = process.argv[2];
	if (!input) {
		console.log('usage:', process.argv[1], '<pr_number | file | url>');
		return;
	}

	async.waterfall([
		function(callback) {
			var pr_number = Number(input),
			    url;
			if (!isNaN(pr_number)) {
				input = config.url + pr_number;
			} else {
				try {
					fs.statSync(input);
					return fs.readFile(input, callback);
				} catch (ex) {
					// nothing
				}
			}

			gnats.fetch(input, callback);
		},
		function(pr_text, callback) {
			var pr = gnats.parse(pr_text);

			// Print the PR.
			console.log(pr);

			callback();
		},
	], function(err) {
		// nothing
	})
}

main();