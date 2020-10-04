// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./PozBenefit.sol";

contract ETHHelper is PozBenefit{
    constructor() public {
        IsPayble = false;
        MinETH = 10000;
    }
    modifier ReceivETH(uint msgValue, address msgSender) {
        if (msgValue >=  MinETH){
             emit TransferInETH(msgValue,msgSender);
        _;
        }
        else revert("Send ETH to invest");
    }
    //@dev not/allow contract to receive funds
    function() public payable {
        if (!IsPayble) revert();
    }

    event TransferOutETH(uint256 Amount, address To);
    event TransferInETH(uint256 Amount, address From);

    bool internal IsPayble;
    uint256 internal MinETH;

     function GetIsPayble() public view returns (bool) {
        return IsPayble;
    }

    function SwitchIsPayble()
        public
        onlyOwner
    {
        IsPayble = !IsPayble;
    }
        function GetMinETH() public view returns (uint256) {
        return MinETH;
    }

    function SetMinETH(uint256 _MinETH) public onlyOwner {
        MinETH = _MinETH;
    }

    function TransferETH(address _Reciver, uint256 _ammount) internal {
        emit TransferOutETH(_ammount, _Reciver);
        _Reciver.transfer(_ammount);
    }
}
