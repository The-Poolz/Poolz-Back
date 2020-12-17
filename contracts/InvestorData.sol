// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Invest.sol";

contract InvestorData is Invest {
    function IsReadyWithdrawInvestment(uint256 _id) public view returns (bool) {
        return
            _id <= TotalInvestors &&
            Investors[_id].TokensOwn > 0 &&
            pools[Investors[_id].Poolid].FinishTime <= now;
    }

    function WithdrawInvestment(uint256 _id) public returns (bool) {
        if (IsReadyWithdrawInvestment(_id)) {
            uint256 temp = Investors[_id].TokensOwn;
            Investors[_id].TokensOwn = 0;
            TransferToken(
                pools[Investors[_id].Poolid].Token,
                Investors[_id].InvestorAddress,
                temp
            );
            pools[Investors[_id].Poolid].UnlockedTokens = SafeMath.add(
                pools[Investors[_id].Poolid].UnlockedTokens,
                temp
            );

            return true;
        }
        return false;
    }

    //Give all the id's of the investment  by sender address
    function GetMyInvestmentIds() public view returns (uint256[]) {
        return InvestorsMap[msg.sender];
    }

    function GetInvestmentData(uint256 _id)
        public
        view
        returns (
            uint256,
            address,
            uint256,
            bool,
            uint256,
            uint256
        )
    {
        require(
            Investors[_id].InvestorAddress == msg.sender || msg.sender == owner,
            "Only for the investor (or Admin)"
        );
        return (
            Investors[_id].Poolid,
            Investors[_id].InvestorAddress,
            Investors[_id].MainCoin,
            Investors[_id].IsPozInvestor,
            Investors[_id].TokensOwn,
            Investors[_id].InvestTime
        );
    }
}
