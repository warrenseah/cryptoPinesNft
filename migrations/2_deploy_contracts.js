const KryptoTreesNft = artifacts.require("KryptoTreesNft");
const MockDai = artifacts.require("Dai");

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(KryptoTreesNft);
  await deployer.deploy(MockDai);
  const mockDai = await MockDai.deployed();
  const kryptoTreesNft = await KryptoTreesNft.deployed();
  await mockDai.faucet();
  console.log('Contracts are deployed successfully.');
};
