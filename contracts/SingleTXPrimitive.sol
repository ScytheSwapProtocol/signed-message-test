// SPDX-License-Identifier: MIT

pragma solidity 0.8.2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SingleTXPrimitive {
    address private _treasury;
    bool private _testVariable;

    constructor(address treasury) {
        require(treasury != address(0), "Zero Treasury Address");

        _treasury = treasury;

        _testVariable = false;
    }

    modifier onlyTreasury {
        require(msg.sender == _treasury, "Not By Treasury");

        _;
    }
    
    function payFor() public {
        _testVariable = true;
    }
    
    function isPaidFor()
        public view returns (bool) {
        return _testVariable;
    }
    
    function validSigner(bytes32 hash,
                         bytes memory command,
                         address signer,
                         uint8 v,
                         bytes32 r,
                         bytes32 s)
        private
        pure
        returns (bool)
    {
        bytes32 payloadHash = keccak256(abi.encode(hash, command));
        
        bytes32 messageHash =
            keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32",
                                       payloadHash));
        
        address actualSigner = ecrecover(messageHash, v, r, s);
        
        return (signer == actualSigner);
    }
    
    function executeDelegatedTX(bytes32 hash,
                                bytes memory command,
                                address signer,
                                uint8 v,
                                bytes32 r,
                                bytes32 s)
        public
        onlyTreasury
    {
        require(validSigner(hash, command, signer, v, r, s), "Invalid Signer");
        
        (bool success, ) = address(this).delegatecall(command);

        require(success, "TX Failed");
    }

    
}
