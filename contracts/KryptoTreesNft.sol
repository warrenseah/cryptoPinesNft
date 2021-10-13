// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';


contract KryptoTreesNft is ERC721, Ownable, ERC721Enumerable {
    using Counters for Counters.Counter;
    using Strings for uint;
    using SafeERC20 for IERC20;
    
    Counters.Counter private _tokenCount;
    
    uint256 public cost = 1 ether;
    uint256 public maxSupply = 10;
    uint256 public maxMintAmount = 2;
    
    string public baseExtension = ".json";
    
    bool public pauseMintingState = true;
    bool public revealed = false;
    
    // Used for random index assignment
    mapping(uint => uint) private tokenMatrix;

    // The initial token ID
    uint public startFrom = 3;
    
    constructor() ERC721("KryptoTrees NFT", "TREE") {
        linearMint(2);
    }
    
    // public
    function mint() external payable ensureAvailabilityFor(1) {
        require(!pauseMintingState, 'Minting is paused.');
        if (msg.sender != owner()) {
            require(msg.value >= cost, 'Need to send the minting fee.');
        }
        _safeMint(msg.sender, nextToken());
    }
    
    function mintTo(address _to, uint _mintAmount) external ensureAvailabilityFor(_mintAmount) payable {
        require(!pauseMintingState, 'Minting is paused.');
        require(_mintAmount > 0, 'Mint amount must be greater than 0.');
        require(_mintAmount <= maxMintAmount, 'Mint amount must not be greater than maxMintAmount');
        
        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount, 'Need to send the minting fee.');
        }
        
        for (uint i = 1; i <= _mintAmount; i++) {
            _safeMint(_to, nextToken());
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
    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }
    
    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }
    
    function setPauseMinting(bool _state) public onlyOwner {
        pauseMintingState = _state;
    }
    
    function reveal(bool _state) public onlyOwner() {
      revealed = _state;
    }
    
    function setCost(uint256 _newCost) public onlyOwner() {
        cost = _newCost;
    }
    
    function setMaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner() {
        maxMintAmount = _newmaxMintAmount;
    }
    
    function setNotRevealedURI(string memory _notRevealedURI) public onlyOwner {
        notRevealedUri = _notRevealedURI;
    }
    
    function withdraw() external payable onlyOwner {
        (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(success);
    }

    function withdrawERC20(address _tokenAddress) external onlyOwner {
        IERC20 token = IERC20(_tokenAddress); 
        uint erc20balance = token.balanceOf(address(this));
        require(erc20balance > 0, "balance is low");
        token.transfer(msg.sender, erc20balance);
    }
    
    /// @dev Check whether tokens are still available
    /// @return the available token count
    function availableTokenCount() public view returns (uint) {
        return maxSupply - _tokenCount.current();
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
    
    /// Get the next token ID
    /// @dev Randomly gets a new token ID and keeps track of the ones that are still available.
    /// @return the next token ID
    function nextToken() internal ensureAvailability returns (uint) {
        uint maxIndex = availableTokenCount();
        uint random = uint(keccak256(
            abi.encodePacked(
                msg.sender,
                block.coinbase,
                block.difficulty,
                block.gaslimit,
                block.timestamp
            )
        )) % maxIndex;

        uint value = 0;
        if (tokenMatrix[random] == 0) {
            // If this matrix position is empty, set the value to the generated random number.
            value = random;
        } else {
            // Otherwise, use the previously stored number from the matrix.
            value = tokenMatrix[random];
        }

        // If the last available tokenID is still unused...
        if (tokenMatrix[maxIndex - 1] == 0) {
            // ...store that ID in the current matrix position.
            tokenMatrix[random] = maxIndex - 1;
        } else {
            // ...otherwise copy over the stored number to the current matrix position.
            tokenMatrix[random] = tokenMatrix[maxIndex - 1];
        }

        // Increment counts
        _tokenCount.increment();

        return value + startFrom;
    }
    
    function linearMint(uint _tries) private onlyOwner {
        require(_tokenCount.current() + 1 <= maxSupply, 'Cannot mint more than total supply.');
        
        for (uint i = 0; i < _tries; i++) {
            _tokenCount.increment();
            _safeMint(msg.sender, _tokenCount.current());
        }
    }
    
    // modifier
    
    /// @dev Check whether another token is still available
    modifier ensureAvailability() {
        require(availableTokenCount() > 0, "No more tokens available");
        _;
    }
    
    /// @param amount Check whether number of tokens are still available
    /// @dev Check whether tokens are still available
    modifier ensureAvailabilityFor(uint amount) {
        require(availableTokenCount() >= amount, "Requested number of tokens not available");
        _;
    }
}