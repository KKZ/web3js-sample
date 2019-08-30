const Web3 = require('web3');
const DEFAULT_TX_CONFIRMATION = 6;

const options = {
    transactionConfirmationBlocks: DEFAULT_TX_CONFIRMATION,
};

var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546", null, options);

async function sendTransaction(_from, _to, _value, _resolve, _reject) {
    let transactionHash;

    // 送金を実施する更新トランザクションを発行する。(コントラクトメソッドの場合も同様)
    // Send an update transaction to perform the remittance. (Same for contract method)
    web3.eth.sendTransaction({
            from: _from,
            to: _to,
            value: _value
        })
        .on('transactionHash', (hash) => {
            console.log(`transactionHash: ${hash}`);
            transactionHash = hash;
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            console.log(`confirmationNumber: ${confirmationNumber}/${DEFAULT_TX_CONFIRMATION} ${transactionHash}`);
            if (confirmationNumber >= DEFAULT_TX_CONFIRMATION) {
                _resolve(receipt);
            }
        })
        .on('error', (err) => {
            _reject(err);
        });
}

async function mainAsync() {
    let blockNumber = await web3.eth.getBlockNumber();
    let accounts = await web3.eth.getAccounts();
    console.log(`Web3 is Connected. #${blockNumber}. accounts:${accounts}`);

    let promises = [];

    // 1st Transaction.
    promises.push(new Promise((resolve, reject) => {
        sendTransaction(accounts[0], accounts[1], '100', resolve, reject);
    }));

    // 2nd Transaction.
    promises.push(new Promise((resolve, reject) => {
        sendTransaction(accounts[1], accounts[2], '100', resolve, reject);
    }));

    // Promiseを順番に開始し、全てresolveされたら後続処理を実行する。
    // Promises are started in order, and when all are resolved, subsequent processing is executed.
    Promise.all(promises)
        .then((results) => {
            console.log('all promise is done.');
            console.log(results);
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        });
};

mainAsync();