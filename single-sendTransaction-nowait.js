const Web3 = require('web3');
const DEFAULT_TX_CONFIRMATION = 6;

const options = {
    transactionConfirmationBlocks: DEFAULT_TX_CONFIRMATION,
};

var web3 = new Web3(Web3.givenProvider || "ws://localhost:8546", null, options);

async function mainAsync() {
    let blockNumber = await web3.eth.getBlockNumber();
    let accounts = await web3.eth.getAccounts();
    console.log(`Web3 is Connected. #${blockNumber}. accounts:${accounts}`);

    // 送金を実施する更新トランザクションを発行する。(コントラクトメソッドの場合も同様)
    // Send an update transaction to perform the remittance. (Same for contract method)
    web3.eth.sendTransaction({
            from: accounts[0],
            to: accounts[1],
            value: '100' // 100wei
        })
        .on('transactionHash', (hash) => {
            // トランザクション発行した段階でログを出力。
            // Log is output when a transaction is sent.
            console.log(`transactionHash: ${hash}`);
            process.exit(0);
        })
        .on('error', (err) => {
            console.error(err);
            process.exit(-1);
        });
};

mainAsync();