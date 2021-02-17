
// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./Manageable.sol";
import "./IWhiteList.sol";

contract MainCoinManager is Manageable {
    event MainCoinAdded (address Token);
    event MainCoinRemoved (address Token);

    function IsERC20Maincoin(address _token) public view returns (bool) {
        return IWhiteList(WhitelistContract).Check(_token, WhitelistID) > 0;
    }
}