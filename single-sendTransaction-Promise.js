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

    new Promise((resolve, reject) => {

        // 送金を実施する更新トランザクションを発行する。(コントラクトメソッドの場合も同様)
        // Send an update transaction to perform the remittance. (Same for contract method)
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
                console.log(`receipt`, receipt);
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                // 指定されたブロック数を超えるまで繰り返しログを出力。
                // 確認ブロック数を超えていれば、ブロックチェーン全体に変更が受け入れられたと判定しても良い。
                // 重大なトランザクションであれば確認ブロック数を多く、軽微なトランザクションであれば確認ブロックを少なくする事が多い。
                console.log(`confirmationNumber: ${confirmationNumber}/${DEFAULT_TX_CONFIRMATION}`);
                if (confirmationNumber >= DEFAULT_TX_CONFIRMATION) {
                    console.log(`transaction is commited.`, receipt);

                    // 指定されたブロックが経過後に処理を行いたい場合はここでresolveする。
                    resolve(receipt);
                }
            })
            .on('error', (err) => {
                console.error(err);

                // エラーが発生した場合はrejectする。
                reject(err);
            });

    }).then((result, err) => {
        // 更新トランザクション完了後に実施する処理。
        if (err) {
            console.error(err);
            process.exit(-1);
        }
        console.log('SendTransaction Promise is done.')
        console.log(result);
        process.exit(0);
    });
};

mainAsync();