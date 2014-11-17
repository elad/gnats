var fs = require('fs'),
    request = require('request'),
    string = require('string'),
    _ = require('underscore');

function fetch(input, callback) {
	try {
		fs.statSync(input);
		return fs.readFile(input, { encoding: 'utf-8' }, callback);
	} catch (ex) {
		// nothing
	}

	request.get(input, function(err, res) {
		if (err || !res.body) {
			return callback(err || 'no data');
		}

		// PRs only use the <b> tag. Get rid of it.
		var pr_text = string(res.body).unescapeHTML().stripTags('b').toString();

		// PRs are wrapped in <pre> tags. Find where we close it and discard everything that follows.
		var idx = pr_text.indexOf('</pre>');
		pr_text = pr_text.substring(0, idx);

		callback(null, pr_text);
	});
}

function parse(pr_text) {
	var pr = {};

	// Email headers come first. They go from the first 'From' to the first empty line.
	var idx1 = pr_text.indexOf('From'),
	    idx2 = pr_text.indexOf('\n\n', idx1),
	    headers = pr_text.substring(idx1, idx2).split('\n');
	// It might be that some lines are broken, so let's try and deal with it by tacking
	// elements whose first character is '\t' on the previous one.
	pr.headers = [];
	for (var i = 0, _len = headers.length, last_i = 0; i < _len; i++) {
		if (!headers[i]) {
			continue;
		}
		if (headers[i][0] !== '\t') {
			pr.headers.push(headers[i]);
			last_i = i;
		} else {
			pr.headers[last_i] += ' ' + headers[i].substring(1)
		}
	}

	// Advance by 2 because our mark is two newlines.
	pr_text = pr_text.substring(idx2 + 2);

	// PRs have fields designated by '>FieldName:' strings at the beginning of lines.
	// Grab all the text associated with each field.
	var fields = pr_text.match(/^\>([A-Za-z-]+):/mg);
	for (var i = 0, _len = fields.length; i < _len; i++) {
		// Get and normalize the field name.
		var raw = fields[i],
		    field_name = raw.substring(1, raw.length - 1).toLowerCase().replace(/\-/g, '_');

		// Some fields have their name and data on the same line. Other fields have them separately.
		// Figure out which one this is.
		idx1 = pr_text.indexOf(raw) + raw.length;
		idx2 = pr_text.indexOf('\n', idx1);
		var field_data = pr_text.substring(idx1, idx2).trim();
		if (field_data) {
			pr[field_name] = field_data;
		} else {
			// This is a multi line field. If there's another field after this one, grab
			// everything between the two. Otherwise, grab everything till the end.
			idx2 = (i + 1 < _len) ? pr_text.indexOf(fields[i + 1], idx1) : undefined;
			field_data = pr_text.substring(idx1, idx2);
			pr[field_name] = field_data;
		}

		// Skip all the text we just processed.
		pr_text = pr_text.substring(idx2);
	}

	return pr;
}

// Exports
exports.fetch = fetch;
exports.parse = parse;
