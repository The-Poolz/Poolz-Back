
// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./Manageable.sol";

contract MainCoinManager is Manageable {
    event MainCoinAdded (address Token);
    event MainCoinRemoved (address Token);

    mapping(address => bool) public ERC20MainCoins; //when approve new erc20 main coin - it will list here

    function AddERC20Maincoin(address _token) public onlyOwner {
        emit MainCoinAdded(_token);
        ERC20MainCoins[_token] = true;
    }

    function RemoveERC20Maincoin(address _token) public onlyOwner {
        emit MainCoinRemoved(_token);
        ERC20MainCoins[_token] = false;
    }

    function IsERC20Maincoin(address _token) public view returns (bool) {
        return ERC20MainCoins[_token];
    }
}