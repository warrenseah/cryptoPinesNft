const KryptoTreesNft = artifacts.require("KryptoTreesNft");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(KryptoTreesNft, {gas: 80000000, gasPrice: 55000000000});
  console.log('Contracts are deployed successfully.');
};
