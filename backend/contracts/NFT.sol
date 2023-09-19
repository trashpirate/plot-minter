// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721A, Ownable {
    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant BATCH_LIMIT = 5;

    IERC20 public paymentToken;
    address public feeAddress;
    uint256 public fee = 1000 * 10 ** 18;

    string private _baseTokenURI;
    string private _contractURI;

    constructor(
        address _tokenAddress,
        address _feeAddress
    ) ERC721A("MyNFT", "MTK") {
        feeAddress = _feeAddress;
        paymentToken = IERC20(_tokenAddress);
        _setBaseURI(
            "ipfs://bafybeifw6ttiueyml3uq2g2567aktxeptjsggcm24stapwlprmoo4dbh7e/"
        );

        _setContractURI(
            "ipfs://bafybeifw6ttiueyml3uq2g2567aktxeptjsggcm24stapwlprmoo4dbh7e/"
        );
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function _setContractURI(string memory newContractURI) private {
        _contractURI = newContractURI;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _setBaseURI(string memory baseURI) private {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // mint NFT for token fee
    function mint(uint256 quantity) external {
        require(quantity <= BATCH_LIMIT, "Exceeds batch limit.");
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Max Supply Hit");
        paymentToken.transferFrom(msg.sender, feeAddress, fee * quantity);
        _mint(msg.sender, quantity);
    }

    // set fee (only owner)
    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    // set the receiver address (only owner)
    function setFeeAddress(address _feeAddress) external onlyOwner {
        feeAddress = _feeAddress;
    }
    //
}
