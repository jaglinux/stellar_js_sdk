var sdk = require('stellar-sdk');
sdk.Network.useTestNetwork();

//var server = new sdk.Server('https://horizon.stellar.org');
var server = new sdk.Server('https://horizon-testnet.stellar.org');
var xlm = new sdk.Asset("XLM");
var cny = new sdk.Asset("CNY", "GAREELUB43IRHWEASCFBLKHURCGMHE5IF6XSE7EXDLACYHGRHM43RFOX");
var mobi = new sdk.Asset("MOBI", "GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH");
console.log(sdk.FastSigning);

const args = process.argv.slice(2);
console.log(args);
let account_id = args;
//console.log("jag asset get code %s ", asset.getCode());
//console.log("jag asset get asset type  %s ", asset.getAssetType());
//console.log("jag asset get Issuer %s ", asset.getIssuer());
//console.log("jag asset is native %d ", asset.isNative());
/*
server.transactions()
    .forLedger(5348504)
    .call().then(function(r) {
          console.log(r);
    });

*/
console.log("jag account id");
server.accounts()
      .accountId(String(account_id))
      .limit(1)
      .call()
      .then(function(r) {
	console.log(r);
	console.log("jag account id callback");
	    for(let balance of r.balances) {
		console.log(balance.asset_type);
		console.log(balance.balance);
	    }
      });
/*
server.transactions()
      .forAccount(String(account_id))
      .limit(20)
      .call()
      .then(function(r) {
	console.log(r);
      });
*/
/*
console.log("jag ledger");
server.ledgers()
	.ledger('16011481')
	.call()
	.then(function(r) {
		console.log("jag ledger callback");
		console.log(r);
	});
*/
/*
console.log("jag asset")
server.orderbook(mobi, xlm)
	.call()
	.then(function(r) {
		console.log(r);
	});
*/
/*
server.orderbook(mobi, xlm)
	.stream({onmessage: orderbook_s})

function orderbook_s(r) {
	console.log("buy order is ", r.bids[0]);
	console.log("sell order is ", r.asks[0]);
}
*/
