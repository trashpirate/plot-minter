// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


interface IMuddyBurn {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}


contract MuddyMinter {
    
    address public contractAddress;
    
    constructor(address _conractAddress) {
        contractAddress = _conractAddress;
    }


}