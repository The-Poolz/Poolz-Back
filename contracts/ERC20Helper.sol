// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract ERC20Helper {
    event TransferOut(uint256 Amount, address To, address Token);
    event TransferIn(uint256 Amount, address From, address Token);
    modifier TestAllownce(
        address _token,
        address _owner,
        uint256 _amount
    ) {
        if (ERC20(_token).allowance(_owner, address(this)) >= _amount) _;
        else revert("No allownce");
    }   
    function TransferToken(
        address _Token,
        address _Reciver,
        uint256 _ammount
    ) internal {
        emit TransferOut(_ammount, _Reciver, _Token);
        ERC20(_Token).transfer(_Reciver, _ammount);
    } 
    function CheckBalance(address _Token,address _Subject) internal view returns(uint256) {
          return ERC20(_Token).balanceOf(_Subject);
    }
    function TransferInToken(address _Token,address _Subject,uint256 _Amount) internal TestAllownce(_Token,_Subject,_Amount) {
        ERC20(_Token).transferFrom(_Subject, address(this), _Amount);
        emit TransferIn(_Amount, _Subject, _Token);
    }
    function IsERC20(address _contractAddress) internal view returns (bool) {
        if (ERC20(_contractAddress).totalSupply() > 0) return true;
        return false; // will revert on false
    }
}