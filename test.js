var Kerberos = require('kerberos').Kerberos;
var kerberos = new Kerberos();
var Ssip = require('kerberos').SSIP;
var http = require('http');
var urlParser = require('url');

var curl = urlParser.parse("http://spenegoendpoint/stuff");

var requestOptions = {
 host: curl.hostname,
 port: curl.port,
 path: curl.path,
 method: "GET",
 withCredentials: false // this is the important part
};

Ssip.SecurityCredentials.acquire("Negotiate", "", function(err, security_credentials) {
	if(err) return callback(err);

	//console.log("HTTP/"+(curl.hostname));
	Ssip.SecurityContext.initialize(security_credentials, "HTTP/"+(curl.hostname), "", function(err, security_context) {
			if(err) throw err;

			var has_context = security_context.hasContext;
			var payload = security_context.payload;

			requestOptions.headers = {
				Authorization: "Negotiate " + payload
			};

			httpGet(requestOptions, function(headers) {
				//console.info(headers);
			});

			//console.info(payload);
			//console.info(has_context);
		});

	// Save credentials
	//console.info(security_credentials);
});

function httpGet(requestOptions, cb) {
	var request = http.request(requestOptions, function (response) {
		var responseContent = "";
		response.setEncoding('utf8');
		response.on('data', function(chunk) {
			responseContent += chunk;
		});
		response.on('end', function() {
			console.info(response.statusCode);
			//console.info(responseContent);
			cb(response.headers['WWW-Authenticate']);
		});
	});

	request.on('error', function (e) {
		console.log(e.message);
	});

	request.end();
}