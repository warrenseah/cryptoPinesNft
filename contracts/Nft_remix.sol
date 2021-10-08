// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC721/ERC721.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/token/ERC721/extensions/ERC721Pausable.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/access/Ownable.sol';
import 'https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/contracts/utils/Counters.sol';

contract NFT is ERC721, Ownable, ERC721Enumerable, ERC721Pausable {
    using Counters for Counters.Counter;
    Counters.Counter public nextId;
    
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        _safeMint(0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2, nextId.current());
        nextId.increment();
    }
    
    // Pause or unpause transfers
    function pauseAllTransfer(bool _state) onlyOwner external {
        require(paused() != _state, 'State is the same, no action is required.');
        if(_state) {
            _pause();
        } else {
            _unpause();
        }
    }
    
    // override inherited contracts
    function _beforeTokenTransfer(address from, address to, uint tokenId) internal override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
        require(!paused(), "ERC721Pausable: token transfer while paused");
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}