const Web3 = require('web3');
const DEFAULT_TX_CONFIRMATION = 6;

const options = {
    transactionConfirmationBlocks: DEFAULT_TX_CONFIRMATION,
};

var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546", null, options);

async function sendTransaction(_from, _to, _value, _resolve, _reject, _partialResults) {
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
                _partialResults.push(receipt);
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
    let partialResults = [];

    // 1st Transaction
    promises.push(new Promise((resolve, reject) => {
        sendTransaction(accounts[0], accounts[1], '100', resolve, reject, partialResults);
    }));

    // 2nd Tranasction
    promises.push(new Promise((resolve, reject) => {
        sendTransaction(accounts[1], accounts[2], '200', resolve, reject, partialResults);
    }));

    // 3rd Transaction. Always fail after 5 seconds.
    promises.push(new Promise((resolve, reject) => {
        setTimeout(() => {
            reject('Fail!');
        }, 5000);
    }));

    // Promiseをに実行開始し、全てresolveされたら後続処理を実行する。
    // 全てのPrimiseが成功/失敗するのを待ってthen処理を行う新メソッド Promise.allSettledを使用している。
    Promise.allSettled(promises)
        .then((results) => {
            console.log('all promise is done.');
            console.log(results);
            process.exit(0);
        })
        .catch((err) => {
            // Promise.allと異なり、Promise全体の例外が発生しない限りこちらには流れてこない。
            console.error(err);
            console.log('these promise are done.');
            console.log(partialResults);
            process.exit(-1);
        });
};

mainAsync();