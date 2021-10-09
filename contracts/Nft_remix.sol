// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC721/ERC721.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/access/Ownable.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/utils/Counters.sol';

contract NFT is ERC721, Ownable, ERC721Enumerable {
    using Counters for Counters.Counter;
    using Strings for uint;
    
    Counters.Counter public nextId;
    
    uint256 public cost = 2000000 gwei;
    uint256 public maxSupply = 10000;
    uint256 public maxMintAmount = 2;
    
    string public baseURI;
    string public baseExtension = ".json";
    string public notRevealedUri;
    
    bool public pauseMintingState = false;
    bool public revealed = false;
    
    constructor(
        string memory _name, 
        string memory _symbol, 
        string memory _initBaseURI,
        string memory _initNotRevealedUri
    ) ERC721(_name, _symbol) {
        mint(msg.sender, 2);
        baseURI = _initBaseURI;
        notRevealedUri = _initNotRevealedUri;
    }
    
    // public
    function mint(address _to, uint _mintAmount) public payable {
        require(!pauseMintingState, 'Minting is paused.');
        require(_mintAmount > 0, 'Mint amount must be greater than 0.');
        require(_mintAmount <= maxMintAmount, 'Mint amount must not be greater than maxMintAmount');
        require(nextId.current() + _mintAmount <= maxSupply, 'Cannot mint more than total supply.');

        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount);
        }

        for (uint i = 1; i <= _mintAmount; i++) {
            nextId.increment();
            _safeMint(_to, nextId.current());
        }
    }
    
    function walletOfOwner(address _owner) 
    public
    view
    returns (uint[] memory) {
        uint ownerTokenCount = balanceOf(_owner);
        uint[] memory tokenIds = new uint[](ownerTokenCount);
        for (uint i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }
    
    function tokenURI(uint256 tokenId)
    public
    view
    virtual
    override
    returns (string memory) {
        require(
          _exists(tokenId),
          "ERC721Metadata: URI query for nonexistent token"
        );
        
        if(revealed == false) {
            return notRevealedUri;
        }
        
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0
            ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension))
            : "";
    }
    
    //only owner
    function reveal() public onlyOwner() {
      revealed = true;
    }
    
    function setCost(uint256 _newCost) public onlyOwner() {
        cost = _newCost;
    }
    
    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner() {
        maxMintAmount = _newmaxMintAmount;
    }
    
    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }
    
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }
    
    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }
    
    function setPauseMinting(bool _state) public onlyOwner {
        pauseMintingState = _state;
    }
    
    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success);
    }
    
    
    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
    
    // override inherited contracts
    function _beforeTokenTransfer(address from, address to, uint tokenId) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}