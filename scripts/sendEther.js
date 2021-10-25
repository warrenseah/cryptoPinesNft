const KryptoTreesNft = artifacts.require('KryptoTreesNft');

// Utils
const ether = (n) => {
    return new web3.utils.BN(
        web3.utils.toWei(n.toString(), 'ether')
    ).toString();
}

const toAddresses = [''];
const sendAmt = ether(1);

module.exports = async function (callback) {

    // perform actions
    const accounts = await web3.eth.getAccounts();
    console.log('From account: ', accounts[0]);
    
    try {
        for (let i = 0; i < toAddresses.length; i++) {
            web3.eth.sendTransaction({
                from: accounts[0],
                to: toAddresses[i],
                value: sendAmt,
            }).then(function(receipt) {
                console.log('Sent txnHash: ',receipt.transactionHash);
                console.log('To address: ', toAddresses[i]);
                console.log(`Sending ${sendAmt} ether...`);
                if(i === toAddresses.length - 1) {
                    callback();
                }
            });
        }
        
    } catch (error) {
        callback(error);
    }
}