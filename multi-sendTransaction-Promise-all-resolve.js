const Web3 = require('web3');
const DEFAULT_TX_CONFIRMATION = 6;

const options = {
    transactionConfirmationBlocks: DEFAULT_TX_CONFIRMATION,
};

var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546", null, options);

async function sendTransaction(_from, _to, _value, _resolve) {
    let transactionHash;

    // 送金を実施する更新トランザクションを発行する。(コントラクトメソッドの場合も同様)
    // Send an update transaction to perform the remittance. (Same for contract method)
    try {
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
                    _resolve({
                        status: 'fulfilled',
                        value: receipt
                    });
                }
            })
            .on('error', (err) => {
                _resolve({
                    status: 'rejected',
                    reason: err
                });
            });
    } catch (err) {
        _resolve({
            status: 'rejected',
            reason: err
        });
    }
}

async function mainAsync() {
    let blockNumber = await web3.eth.getBlockNumber();
    let accounts = await web3.eth.getAccounts();
    console.log(`Web3 is Connected. #${blockNumber}. accounts:${accounts}`);

    let promises = [];

    // 1st Transaction.
    promises.push(new Promise((resolve) => {
        sendTransaction(accounts[0], accounts[1], '100', resolve);
    }));

    // 2nd Transaction.
    promises.push(new Promise((resolve) => {
        sendTransaction(accounts[1], accounts[2], '100', resolve);
    }));

    // 3rd Transaction. Always fail after 5 seconds.
    promises.push(new Promise((resolve) => {
        setTimeout(() => {
            console.error('3rd Promise is Failed!');
            resolve({
                status: 'rejected',
                reason: 'Its Failed!'
            });
        }, 5000);
    }));

    // Promiseを順番に開始し、全てresolveされたら後続処理を実行する。
    // Promises are started in order, and when all are resolved, subsequent processing is executed.
    Promise.all(promises)
        .then((results) => {
            console.log('all promise is done.');
            results.forEach((result) => {
                if (result.status === 'rejected') {
                    console.error(result);
                } else {
                    console.log(result);
                }
            })
            process.exit(0);
        })
        .catch((err) => {
            console.error(err);
            process.exit(-1);
        });
};

mainAsync();