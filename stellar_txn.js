var sdk = require('stellar-sdk');
sdk.Network.useTestNetwork();

var storage = require('node-persist');
var request = require('request');
var server = new sdk.Server('https://horizon-testnet.stellar.org');
let pr = [];
let pu = [];
var sha256 = require('sha.js');
var BigNumber = require('big-number');

const crypto = require('crypto');
const delay = require('delay');

const stroop = "0.0000001";

storage.initSync();
//storage.clearSync();
//process.exit();

const args = process.argv.slice(2);
console.log(args);
if(args == "new") {
	console.log("create new account");
	let count = storage.getItemSync("count");
	var keypair = sdk.Keypair.random();
	let pu = "pu_" + count.toString();
	let pr = "pr_" + count.toString();
	storage.setItemSync(pu, keypair.publicKey());
	storage.setItemSync(pr, keypair.secret());
	storage.setItemSync("count", ++count);
	//fund the account
	console.log("funding new account");
	fund_new_account(keypair.publicKey());
} else {
	let count = storage.getItemSync("count");
	console.log("count in storage is ", count);
	if(!count) {
		//initialize the count
		storage.setItemSync("count", 0);
	} else {
		for(let i=0; i<count; i++) {
			pr[i] = storage.valuesWithKeyMatch("pr_"+i.toString());
			pu[i] = storage.valuesWithKeyMatch("pu_"+i.toString());
		}
		for(let i=0; i<count; i++) {
			console.log("pu ",i,pu[i]);
			console.log("pr ",i,pr[i]);
		}
	}
	main();
}

function  main() {

/*
		var asset = new sdk.Asset("RUPEE", pu_key_first);
		//txn_change_trust(pu_key_third, key_3, asset);
		//txn_vote(pu_key_second, pu_key_third, key_3, asset, stroop, '5');
*/
//		txn_transfer(String(pu[1]), String(pu[2]), String(pr[2]), sdk.Asset.native(), '10');
//		txn_transfer_multisig(String(pu[2]), String(pu[1]), String(pr[1]), sdk.Asset.native(), '10', String(pr[0]));

//		txn_set_master_key(String(pu[4]), String(pr[4]), "2");
//		txn_threshold(String(pu[4]), String(pr[4]), 2, 2, 2);

//		txn_add_signer(String(pu[0]), String(pu[1]), String(pr[1]), '1');
//preimage hash
		if(0) {
			const preimage = crypto.randomBytes(32)
			txn_add_hash(String(pu[4]), String(pr[4]), preimage);
			delay(10000)
    			.then(() => {
				txn_transfer_multihash(String(pu[0]), String(pu[4]), String(pr[4]), sdk.Asset.native(), '10', preimage);
    			});
		}
		if(1) {
			//escrow account
			//txn_set_master_key(String(pu[6]), String(pr[6]), "2");
			//txn_threshold(String(pu[6]), String(pr[6]), 2, 2, 2);
			let tx;
			create_tx(String(pu[6]), String(pu[0]), sdk.Asset.native());
		}
}

function create_tx(pu, dest, asset_param) {
	console.log("create_tx");
	server.loadAccount(pu).then(function(receiver) {
		console.log(receiver.sequence);
		var escrowSequence = new BigNumber(receiver.sequence);
		receiver.sequence++;
		tx = new sdk.TransactionBuilder(receiver, receiver.sequence.toString())
 			.addOperation(sdk.Operation.payment({
					destination: dest,
        				asset: asset_param,
        				amount: '10'
    		}))
  		.build();
		console.log(escrowSequence);
		delay(1000)
    			.then(() => {
			add_tx_hash(tx, pu, String(pr[6]));
    		});
	})
}

function add_tx_hash(tx, pu, pr) {
	console.log("add_tx_hash", pu, pr);
	sourceKeypair = sdk.Keypair.fromSecret(pr);
	server.loadAccount(pu).then(function(receiver) {
		console.log(receiver);
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.setOptions({
					signer: {preAuthTx:tx.hash(),
						weight: 2},
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("jag error", error);
		});
	})
	delay(10000)
    		.then(() => {
		tx.sign(sourceKeypair);
		server.submitTransaction(tx).then(function(value) {
			console.log(value);
		})
    	});
}

function txn_transfer(dest, source, source_pr , asset_param, qty) {
	console.log("txn_transfer");
	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	console.log(dest, source, asset_param, qty);
	server.loadAccount(source).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.payment({
					destination: dest,
        				asset: asset_param,
        				amount: qty
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		console.log(transaction);
		let tx = transaction.toEnvelope().toXDR("base64");
		let transaction_1 = new sdk.Transaction(tx);
		server.submitTransaction(transaction_1).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_transfer_multisig(dest, source, source_pr , asset_param, qty, sec_sign) {
	console.log("txn_transfer_multisig");
	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	secKeypair = sdk.Keypair.fromSecret(sec_sign);
	console.log(dest, source, asset_param, qty);
	server.loadAccount(source).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.payment({
					destination: dest,
        				asset: asset_param,
        				amount: qty
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		transaction.sign(secKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_transfer_multihash(dest, source, source_pr , asset_param, qty, message) {
	console.log("jag txn_transfer_multihash");

	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	console.log(dest, source, asset_param, qty, message);
	server.loadAccount(source).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.payment({
					destination: dest,
        				asset: asset_param,
        				amount: qty
    		}))
  		.build();
		//transaction.sign(sourceKeypair);
		transaction.signHashX(message);
		console.log("jag 1");
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_set_master_key(source_pu, source_pr, new_master_key) {
	console.log("txn_set_master");
	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	server.loadAccount(source_pu).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.setOptions({
					masterWeight: new_master_key,
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_threshold(source_pu, source_pr, lt, mt, ht) {
	console.log("txn_threshold");
	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	server.loadAccount(source_pu).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.setOptions({
					lowThreshold: lt,
					medThreshold: mt,
					highThreshold: ht
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_add_signer(new_key_pu, source_pu, source_pr, weight_param) {
	console.log("txn_add_signer");
	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	server.loadAccount(source_pu).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.setOptions({
					signer: {ed25519PublicKey:new_key_pu,
						weight: weight_param},
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_change_trust(source, sourceKeypair, asset_rupee) {
	server.loadAccount(source).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.changeTrust({
        				asset: asset_rupee,
        				limit: '100'
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_vote(dest, source, sourceKeypair, asset_rupee, qty, memo) {
	memo_data = new sdk.Memo(sdk.MemoID, memo);
	server.loadAccount(source).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.payment({
					destination: dest,
        				asset: asset_rupee,
        				amount: qty
    		}))
 			.addMemo(memo_data)
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function txn_add_hash(source_pu, source_pr, message) {
	console.log("txn_add_hash");

	//let hash = sha256('sha256').update(message).digest('hex');
	let hash = crypto.createHash('sha256');
	hash.update(message);
	sourceKeypair = sdk.Keypair.fromSecret(source_pr);
	server.loadAccount(source_pu).then(function(receiver) {
		var transaction = new sdk.TransactionBuilder(receiver)
 			.addOperation(sdk.Operation.setOptions({
					signer: {sha256Hash : hash.digest('hex'),
						weight: 2},
    		}))
  		.build();
		transaction.sign(sourceKeypair);
		server.submitTransaction(transaction).then(function(value) {
			console.log(value);
		})
		.catch(function(error) {
			console.log("error", error);
		});
	})
}

function fund_new_account(pu) {
/*
	var key_friend = sdk.Keypair.fromSecret("SA3W53XXG64ITFFIYQSBIJDG26LMXYRIMEVMNQMFAQJOYCZACCYBA34L");
	txn_transfer(keypair.publicKey(), "GBW74UVOXKGHO3WX6AV5ZGTB4JYBKCEJOUQAUSI25NRO3PKY5BC7WYZS", key_friend, sdk.Asset.native(), '20');
*/
	request.get({
  		url: 'https://horizon-testnet.stellar.org/friendbot',
  		qs: { addr: pu },
  		json: true
	}, function(error, response, body) {
  		if (error || response.statusCode !== 200) {
    			console.error('ERROR!', error || body);
  		}
  		else {
    			console.log('SUCCESS! You have a new account :)\n', body);
			server.accounts()
      			.accountId(pu)
      			.call()
      			.then(function(r) {
				console.log("account id callback");
	    			for(let balance of r.balances) {
					console.log(balance.asset_type);
					console.log(balance.balance);
	    			}
      			});
  		}
	});
}
