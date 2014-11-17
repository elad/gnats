var gnats = require('./');

var config = {
	url: 'http://gnats.netbsd.org/',
};

function main() {
	var input = process.argv[2];
	if (!input) {
		console.log('usage:', process.argv[1], '<pr_number | file | url>');
		return;
	}

	var pr_number = Number(input);
	if (!isNaN(pr_number)) {
		input = config.url + pr_number;
	}

	gnats.fetch(input, function (err, pr_text) {
		if (err) {
			console.log('Error:', err);
			return;
		}

		var pr = gnats.parse(pr_text);
		console.log(pr);
	});
}

main();
