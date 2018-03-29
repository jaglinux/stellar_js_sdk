var sdk = require('stellar-sdk');
sdk.Network.useTestNetwork();

var server = new sdk.Server('https://horizon-testnet.stellar.org');
var xlm = new sdk.Asset("XLM");
var cny = new sdk.Asset("CNY", "GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX");
var mobi = new sdk.Asset("MOBI", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH");

console.log("jag asset");
server.assets()
      .forCode("RUPEE")
      .call()
      .then(function(r) {
	console.log(r);
      });
