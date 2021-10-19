const { expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { assert } = require('chai');
const KryptoTreesNft = artifacts.require("KryptoTreesNft");
// const Dai = artifacts.require('Dai');

contract("KryptoTreesNft", accounts => {
  let kryptoTreesNft;
  const [admin, nftTrader, nftTrader2] = accounts;
  let uriNotRevealed;
  const mintFee = parseInt(web3.utils.toWei('1'));

  beforeEach( async() => {
    kryptoTreesNft = await KryptoTreesNft.new();
    uriNotRevealed = await kryptoTreesNft.notRevealedUri();
  });
  
  // test initial contract state
  it('should deploy smart contract properly', async () => {
    assert(KryptoTreesNft.address !== '');
  });

  it('should deploy with these settings', async () => {
    const name = await kryptoTreesNft.name();
    assert(name.toString() === 'KryptoTrees NFT');
    const symbol = await kryptoTreesNft.symbol();
    assert(symbol.toString() === 'TREE');
    const maxSupply = await kryptoTreesNft.maxSupply();
    assert(maxSupply.toNumber() === 10000);
    const mintingState = await kryptoTreesNft.pauseMintingState();
    assert(mintingState === true);
    const revealedState = await kryptoTreesNft.revealed();
    assert(revealedState  === false);
    const cost = await kryptoTreesNft.cost();
    assert(cost.toString()  === web3.utils.toWei('1', 'ether'));
    const startFrom = await kryptoTreesNft.startFrom();
    assert(startFrom.toNumber()  === 201);
    const availableTokens = await kryptoTreesNft.availableTokenCount();
    assert(availableTokens.toNumber() === 9800);
  });

  it('should not reveal tokenURI', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const mintingState = await kryptoTreesNft.pauseMintingState();
    assert(mintingState === false);
    await kryptoTreesNft.mint();
    const adminTokenID = await kryptoTreesNft.walletOfOwner(admin);
    const tokenNotRevealed = await kryptoTreesNft.tokenURI(adminTokenID[0].toNumber());
    assert(tokenNotRevealed, uriNotRevealed);
  });

  it('should mint 200 at initial deployment', async () => {
    const availableTokens = await kryptoTreesNft.availableTokenCount();
    assert(availableTokens.toNumber()  === 9800);
    const totalSupply = await kryptoTreesNft.totalSupply();
    assert(totalSupply.toNumber()  === 200);
  });

  it('admin should linearMint 200 at initial deployment', async () => {
    const adminBal = await kryptoTreesNft.balanceOf(admin);
    assert(adminBal.toNumber()  === 200);
    const adminTokenID = await kryptoTreesNft.walletOfOwner(admin);
    assert(adminTokenID[0].toNumber() + 1 === adminTokenID[1].toNumber());
  });

  it('should reveal tokenURI', async () => {
    await kryptoTreesNft.reveal(true);
    const revealState = await kryptoTreesNft.revealed();
    assert(revealState === true);
    const adminTokenID = await kryptoTreesNft.walletOfOwner(admin);
    const tokenNotRevealed = await kryptoTreesNft.tokenURI(adminTokenID[0].toNumber());
    assert(tokenNotRevealed !== uriNotRevealed);
  });

  // Test mint and mintTo function
  it('should not be able to mint', async () => {
    await expectRevert(
      kryptoTreesNft.mint({from: admin}),
      'Minting is paused.'
    );
  });

  it('should randomly mint nft called by admin with zero cost', async() => {
    await kryptoTreesNft.setPauseMinting(false);
    const mintingState = await kryptoTreesNft.pauseMintingState();
    assert(mintingState === false);
    await kryptoTreesNft.mint();
    const adminBal = await kryptoTreesNft.balanceOf(admin);
    assert(adminBal.toNumber() === 201);
    const adminTokenID = await kryptoTreesNft.walletOfOwner(admin);
    assert(adminTokenID[200].toNumber() !== 201);
  });

  it('should throw when nftTrader mint with zero cost', async() => {
    await kryptoTreesNft.setPauseMinting(false);
    const mintingState = await kryptoTreesNft.pauseMintingState();
    assert(mintingState === false);
    await expectRevert(
      kryptoTreesNft.mint({ from: nftTrader }),
      'Need to send the minting fee.'
    );
  });

  it('should mint successfully by nftTrader', async() => {
    await kryptoTreesNft.setPauseMinting(false);
    const mintingState = await kryptoTreesNft.pauseMintingState();
    assert(mintingState === false);
    await kryptoTreesNft.mint({ from: nftTrader, value:mintFee });
    const nftTraderBal = await kryptoTreesNft.balanceOf(nftTrader);
    assert(nftTraderBal.toNumber() === 1);
  });

  it('should throw when mintTo nftTrader2 by admin', async () => {
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === true);
    await expectRevert(
      kryptoTreesNft.mintTo(nftTrader2, 1, { from: admin }),
      'Minting is paused.'
    );
  });

  it('should mintTo nftTrader2 by admin', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await kryptoTreesNft.mintTo(nftTrader2, 2, { from: admin });
    const trader2Bal = await kryptoTreesNft.balanceOf(nftTrader2);
    assert(trader2Bal.toNumber() === 2);
  });

  it('should throw with mintTo amount set to zero', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await expectRevert(
      kryptoTreesNft.mintTo(nftTrader2, 0, { from: admin }),
      'Mint amount must be greater than 0.'
    );
  });

  it('should throw with mintTo amount set to greater than maxMintAmt', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await expectRevert(
      kryptoTreesNft.mintTo(nftTrader2, 11, { from: admin }),
      'Mint amount must not be greater than maxMintAmount'
    );
  });

  it('should throw with mintTo by nftTrader without minting fee', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await expectRevert(
      kryptoTreesNft.mintTo(nftTrader2, 1, { from: nftTrader }),
      'Need to send the minting fee.'
    );
  });

  it('should mintTo nftTrader2 address called from nftTrader with minting fee', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await kryptoTreesNft.mintTo(nftTrader2, 1, { from: nftTrader, value: mintFee });
    const traderEthBal = await web3.eth.getBalance(nftTrader);
    assert(traderEthBal <= web3.utils.toWei('99'));
    const trader2Bal = await kryptoTreesNft.balanceOf(nftTrader2);
    assert(trader2Bal.toNumber() === 1);
  });

  it('should mintTo nftTrader2 address 2 TREE nft called from nftTrader with minting fee', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    const twoMintFee = mintFee * 2;
    await kryptoTreesNft.mintTo(nftTrader2, 2, { from: nftTrader, value: twoMintFee });
    const trader2Bal = await kryptoTreesNft.balanceOf(nftTrader2);
    assert(trader2Bal.toNumber() === 2);
  });

  it('should throw mintTo nftTrader2 address 2 TREE nft called from nftTrader with insufficient minting fee', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await expectRevert(
      kryptoTreesNft.mintTo(nftTrader2, 2, { from: nftTrader, value: mintFee }),
      'Need to send the minting fee.'
    );
  });

  // it('should throw with mintTo by nftTrader when exceeding maxSupply', async () => {
  //   await kryptoTreesNft.setPauseMinting(false);
  //   const pauseMintingState = await kryptoTreesNft.pauseMintingState();
  //   assert(pauseMintingState === false);
  //   await kryptoTreesNft.setMaxMintAmount(12);
  //   const maxSupply = await kryptoTreesNft.maxMintAmount();
  //   assert(maxSupply.toNumber() === 12);

  //   await expectRevert(
  //     kryptoTreesNft.mintTo(nftTrader2, 11),
  //     'Requested number of tokens not available'
  //   );
  // });

  // Test onlyOwner modifer
  it('should throw if not reveal by owner', async () => {
    await expectRevert(
      kryptoTreesNft.reveal(true, {from: nftTrader}),
      'Ownable: caller is not the owner'
    );
  });

  // Test withdraw function
  it('should withdraw eth balance to owner wallet', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    const totalMintFee = mintFee * 2;
    await kryptoTreesNft.mintTo(nftTrader2, 2, { from: nftTrader, value: totalMintFee });
    const trader2Bal = await kryptoTreesNft.balanceOf(nftTrader2);
    assert(trader2Bal.toNumber() === 2);
    await kryptoTreesNft.withdraw();
    const adminEthBal = await web3.eth.getBalance(admin);
    assert(adminEthBal >= web3.utils.toWei('101'));
  });

  it('should throw when withdraw called by non owner', async () => {
    await kryptoTreesNft.setPauseMinting(false);
    const pauseMintingState = await kryptoTreesNft.pauseMintingState();
    assert(pauseMintingState === false);
    await kryptoTreesNft.mintTo(nftTrader2, 1, { from: nftTrader, value: mintFee });
    const trader2Bal = await kryptoTreesNft.balanceOf(nftTrader2);
    assert(trader2Bal.toNumber() === 1);
    await expectRevert(
      kryptoTreesNft.withdraw({ from: nftTrader }),
      'Ownable: caller is not the owner'
    );
  });

  // it("should withdraw mockDai to owner's address", async () => {
  //   const dai = await Dai.deployed();
  //   await dai.transfer(kryptoTreesNft.address, web3.utils.toWei('1'), {from: admin});

  //   const contractDai = await dai.balanceOf(kryptoTreesNft.address);
  //   // console.log('Contract dai balance: ', contractDai.toString());
  //   assert(contractDai.toString() === web3.utils.toWei('1'));

  //   const adminDaiBefore = await dai.balanceOf(admin);
  //   // console.log('Before admin dai balance: ', adminDaiBefore.toString());
  //   assert(adminDaiBefore.toString() === web3.utils.toWei('99'));

  //   await kryptoTreesNft.withdrawERC20(dai.address);

  //   const adminDaiAfter = await dai.balanceOf(admin);
  //   // console.log('After admin dai balance: ', adminDaiAfter.toString());
  //   assert(adminDaiAfter.toString() >= web3.utils.toWei('100'));
  // });

  // Change mintFee cost
  it('should change mint cost', async () => {
    const doubleFee = web3.utils.toBN(2 * mintFee);
    await kryptoTreesNft.setCost(doubleFee.toString());
    const changeCost = await kryptoTreesNft.cost();
    assert(changeCost.toString() === doubleFee.toString());
  });

});
