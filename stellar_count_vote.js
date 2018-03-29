var sdk = require('stellar-sdk');
sdk.Network.useTestNetwork();

//var server = new sdk.Server('https://horizon.stellar.org');
var server = new sdk.Server('https://horizon-testnet.stellar.org');
var token = undefined;
var vote_0 = 0;
var vote_1 = 0;

console.log(sdk.FastSigning);

setTimeout(count, 1 * 1000);

function count() {
	console.log("count func");
	if(token == undefined) {
		server.transactions()
      			.forAccount('GAWF5L32HOHI5D6G4B2NDHBJVFFAOVJTZXUPJL4FJ5ESPQKP4YIPAXOO')
      			//.cursor("32488391052365824")
      			.limit(1)
      			.call()
      			.then(function(r) {
				//console.log(r);
				if(r.records[0] == undefined) {
					console.log("count func token is still undefined");
					setTimeout(count, 20 * 1000);
					return;
				} else {
					console.log("count func token defined");
					console.log(r.records[0].paging_token);
					console.log(r.records[0].memo);
					token = r.records[0].paging_token;
					parse_vote(r.records[0].memo);
					recursive_account();
				}
      			});
	} else {
		console.log("count func else");
		recursive_account();
	}
}	

function recursive_account() {
	console.log("recursive function", token);
	server.transactions()
      		.forAccount('GAWF5L32HOHI5D6G4B2NDHBJVFFAOVJTZXUPJL4FJ5ESPQKP4YIPAXOO')
      		.cursor(token)
      		.limit(1)
      		.call()
      		.then(function(r) {
			console.log(r);
			if (r.records[0] == undefined) {
				console.log("recursive function [0] no paging token, exit");
				setTimeout(count, 20 * 1000);
				return;
			} else {
				console.log("recursive function [0] paging token exists");
				parse_vote(r.records[0].memo);
				token = r.records[0].paging_token;
				recursive_account();
			}
      		});
	
}

function parse_vote(vote) {
	if(vote == "4")
		vote_0++;
	else if(vote == "5")
		vote_1++;
	console.log("parse_vote vote_0 is ",vote_0);
	console.log("parse_vote vote_1 is",vote_1);
}

