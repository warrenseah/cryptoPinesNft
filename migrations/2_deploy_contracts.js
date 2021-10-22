const KryptoTreesNft = artifacts.require("KryptoTreesNft");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(KryptoTreesNft);
  console.log('Contracts are deployed successfully.');
};
