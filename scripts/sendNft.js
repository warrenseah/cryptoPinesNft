const KryptoTreesNft = artifacts.require('KryptoTreesNft');


module.exports = async function (callback) {
    // perform actions
    const kryptoTreesNft = new web3.eth.Contract(KryptoTreesNft.abi, '');
    console.log(kryptoTreesNft.options.address);

    const availableToken = await kryptoTreesNft.methods.availableTokenCount().call();
    console.log(availableToken.toString());

    callback();
}