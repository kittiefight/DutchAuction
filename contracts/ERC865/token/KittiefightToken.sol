pragma solidity ^0.5.10;

import "../../openzeppelin-solidity/token/ERC20/PausableToken.sol";
import "../../openzeppelin-solidity/token/ERC20/CappedToken.sol";

/**
 * @title Kittiefight Token
 * @dev ERC20 Token (KTY)
 *
 * KTY are divisible by 1e18 base
 *
 * KTY are displayed using 18 decimal places of precision.
 *
 * 100 milion KTY (total supply)
 *
 */

contract KittiefightToken is PausableToken, CappedToken {

    /* Set the token symbol for display */
    string public constant symbol = "KTY";

    /* Set the token name for display */
    string public constant name = "Kittiefight";

    /* Set the number of decimals for display */
    uint8 public constant decimals = 18;

    /* 100 milion KTY specified */
    uint256 public constant amountOfTokenToMint = 10**8 * 10**uint256(decimals);

    /* Is crowdsale filtering non registered users. false by default */
    bool public isTransferWhitelistOnly = false;

    /* Mapping of whitelisted users */
    mapping (address => bool) transfersWhitelist;

    event UserTransferWhitelistStatusChange(address user, bool whitelisted);

    event TransferWhitelistOnly(bool flag);


    constructor() CappedToken(amountOfTokenToMint) public {
        
    }

    /**
     * @notice Is the address allowed to transfer
     * @return true if the sender can transfer
     */
    function isUserAllowedToTransfer(address _user) public view returns (bool) {
        require(_user != address(0));
        return transfersWhitelist[_user];
    }

    /**
     * @notice Enabling / Disabling transfers of non whitelisted users
     */
    function setWhitelistedOnly(bool _isWhitelistOnly) onlyOwner public {
        if (isTransferWhitelistOnly != _isWhitelistOnly) {
            isTransferWhitelistOnly = _isWhitelistOnly;
            emit TransferWhitelistOnly(_isWhitelistOnly);
        }
    }

    /**
     * @notice Adding a user to the whitelist
     */
    function whitelistUserForTransfers(address _user) onlyOwner public {
        require(!isUserAllowedToTransfer(_user));
        transfersWhitelist[_user] = true;
        emit UserTransferWhitelistStatusChange(_user, true);
    }

    /**
     * @notice Remove a user from the whitelist
     */
    function blacklistUserForTransfers(address _user) onlyOwner public {
        require(isUserAllowedToTransfer(_user));
        transfersWhitelist[_user] = false;
        emit UserTransferWhitelistStatusChange(_user, false);
    }

    /**
    * @notice transfer token for a specified address
    * @param _to The address to transfer to.
    * @param _value The amount to be transferred.
    */
    function transfer(address _to, uint256 _value) public returns (bool) {
      if (isTransferWhitelistOnly) {
        require(isUserAllowedToTransfer(msg.sender));
      }
      return super.transfer(_to, _value);
    }

    /**
     * @notice Transfer tokens from one address to another
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        if (isTransferWhitelistOnly) {
            require(isUserAllowedToTransfer(_from));
        }
        return super.transferFrom(_from, _to, _value);
    }

}
