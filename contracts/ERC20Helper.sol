// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./TokenList.sol";

contract ERC20Helper is TokenList {
    event TransferOut(uint256 Amount, address To, address Token);
    event TransferIn(uint256 Amount, address From, address Token);
    modifier TestAllownce(
        address _token,
        address _owner,
        uint256 _amount
    ) {
        require(ERC20(_token).allowance(_owner, address(this)) >= _amount, "no allowance"); 
        _;
    }   
    function TransferToken(
        address _Token,
        address _Reciver,
        uint256 _ammount
    ) internal{
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
}