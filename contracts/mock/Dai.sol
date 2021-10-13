// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Dai is ERC20 {
    constructor() ERC20('Mock Dai', 'DAI') {}
    function faucet() external {
        _mint(msg.sender, 100 * 10 ** 18);
    }
}