// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./Invest.sol";

contract InvestorData is Invest {
    function WithdrawInvestment(uint256 _id) public returns (bool) {
        if (_id <= TotalInvestors &&
         Investors[_id].TokensOwn > 0 &&
        GetPoolStatus(Investors[_id].Poolid) == PoolStatus.Finished  ) {
            TransferToken(
                pools[Investors[_id].Poolid].Token,
                Investors[_id].InvestorAddress,
                Investors[_id].TokensOwn
            );
            Investors[_id].TokensOwn = 0;
            return true;
        }
        return false;
    }

    //Give all the id's of the investment  by sender address
    function GetMyInvestmentIds() public view returns (uint256[]) {
        return InvestorsMap[msg.sender];
    }
}
