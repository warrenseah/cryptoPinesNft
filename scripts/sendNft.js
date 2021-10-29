const KryptoTreesNft = artifacts.require('KryptoTreesNft');


module.exports = async function (callback) {
    // perform actions

    // load correct loaded wallet
    const [admin, senderWallet] = await web3.eth.getAccounts();

    // get nft token id array from Contract instance
    const kryptoTreesNft = new web3.eth.Contract(KryptoTreesNft.abi, '');

    const tokensArray = await kryptoTreesNft.methods.walletOfOwner(senderWallet).call();
    // console.log(tokensArray);

    // Get no of transaction count from senderWallet
    // const nonce = await web3.eth.getTransactionCount(senderWallet);
    // console.log(nonce);

    // Create sending object
    const sendObj = [
        { address: '', noNft: 2 }
    ];

    try {
        let tokenCounter = 0;
        for (const [index, obj] of sendObj.entries()) {
            for(let i = 0; i < obj.noNft; i++) {

                kryptoTreesNft.methods.safeTransferFrom(senderWallet, obj.address, tokensArray[tokenCounter]).send({
                    from: senderWallet,
                    gasPrice: 30000000000
                }).then(function (receipt) {
                    console.log('Sent txnHash: ', receipt.transactionHash);
                    if(i === obj.noNft - 1 && index === sendObj.length - 1) {
                        callback();
                    }
                });
                console.log('SentId: ', tokenCounter);
                console.log('To: ', obj.address);
                console.log('Sent tokenID: ', tokensArray[tokenCounter]);
                tokenCounter += 1;
                
            }
        }
    } catch (error) {
        console.error(error);
        callback(error);
    }

}