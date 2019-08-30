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

    // 送金トランザクションを送信する。(コントラクトメソッドの場合も同様)
    // Send a remittance transaction. (Same for contract method)
    web3.eth.sendTransaction({
            from: accounts[0],
            to: accounts[1],
            value: '100' // 100wei
        })
        .on('transactionHash', (hash) => {
            // トランザクション発行した段階でログを出力。
            console.log(`transactionHash: ${hash}`);
        })
        .on('receipt', (receipt) => {
            // トランザクション発行が受け付けられた段階でログを出力。
            // ただし、そのトランザクションがNW分断などを乗り越えてブロックチェーン全体受け付けられるかはこの段階ではわからない。
            // Log is output when a transaction is sent.
            // However, it is not known at this stage whether the transaction will be accepted.
            console.log(`receipt`, receipt);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
            // 指定されたブロック数を超えるまで繰り返しログを出力。
            // 確認ブロック数を超えていれば、ブロックチェーン全体に変更が受け入れられたと判定しても良い。
            // 重大なトランザクションであれば確認ブロック数を多く、軽微なトランザクションであれば確認ブロックを少なくする事が多い。
            // Outputs logs repeatedly until the specified number of blocks is exceeded.
            // If the number of confirmation blocks is exceeded, it may be determined that the change has been accepted for the entire block chain.
            // For serious transactions, the number of confirmation blocks is often increased, and for minor transactions, confirmation blocks are often decreased.
            console.log(`confirmationNumber: ${confirmationNumber}/${DEFAULT_TX_CONFIRMATION}`);
            if (confirmationNumber >= DEFAULT_TX_CONFIRMATION) {
                console.log(`transaction is commited.`, receipt);
                process.exit(0);
            }
        })
        .on('error', (err) => {
            console.error(err);
            process.exit(-1);
        });
};

mainAsync();