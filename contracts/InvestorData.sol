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

    function WithdrawInvestment(uint256 _id) public returns (bool) {
        if (IsReadyWithdrawInvestment(_id)) {
            if(isUsingLockedDeal()){
                return ILockedDeal(LockedDealAddress).WithdrawToken(Investors[_id].LockedDealId);
            } else {
                uint256 temp = Investors[_id].TokensOwn;
                Investors[_id].TokensOwn = 0;
                TransferToken(
                    pools[Investors[_id].Poolid].BaseData.Token,
                    Investors[_id].InvestorAddress,
                    temp
                );
                pools[Investors[_id].Poolid].MoreData.UnlockedTokens = SafeMath.add(
                    pools[Investors[_id].Poolid].MoreData.UnlockedTokens,
                    temp
                );
                return true;
            }
        }
        return false;
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
            uint256,
            uint256
        )
    {
        return (
            Investors[_id].Poolid,
            Investors[_id].InvestorAddress,
            Investors[_id].MainCoin,
            Investors[_id].TokensOwn,
            Investors[_id].InvestTime,
            Investors[_id].LockedDealId,
        );
    }
}
