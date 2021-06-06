// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Invest.sol";

contract InvestorData is Invest {
    function IsReadyWithdrawInvestment(uint256 _id) public view returns (bool) {
        return
            _id <= TotalInvestors &&
            Investors[_id].TokensOwn > 0 &&
            pools[Investors[_id].Poolid].MoreData.LockedUntil <= now;
    }

    //Give all the id's of the investment  by sender address
    function GetMyInvestmentIds() public view returns (uint256[] memory) {
        return InvestorsMap[msg.sender];
    }

    function GetInvestmentData(uint256 _id)
        public
        view
        returns (
            uint256,
            address,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            Investors[_id].Poolid,
            Investors[_id].InvestorAddress,
            Investors[_id].MainCoin,
            Investors[_id].TokensOwn,
            Investors[_id].InvestTime
        );
    }
}
