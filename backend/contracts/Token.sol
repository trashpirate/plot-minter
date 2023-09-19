// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(address _owner) ERC20("MyToken", "MTK") {
        _mint(_owner, 1000000000 * 10 ** decimals());
        _transferOwnership(_owner);
    }
}
