// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./InvestorData.sol";

contract ThePoolz is InvestorData {
    event InvestorsWork(uint256 NewStart, uint256 TotalDone);
    event ProjectOwnerWork(uint256 NewStart, uint256 TotalDone);

    constructor() public {
        StartInvestor = 0;
        StartProjectOwner = 0;
    }

    uint256 internal StartInvestor;
    uint256 internal StartProjectOwner;

    function Work() external returns (uint256, uint256) {
        uint256 inv = WorkForInvestors();
        uint256 pro = WorkForProjectOwner();
        if (inv == 0 && pro ==0) revert("No work to be done");
        return (inv,pro);
    }

    function WorkForInvestors() internal returns (uint256) {
        uint256 WorkDone = 0;
        bool FixStart = true;
        for (uint256 index = StartInvestor; index < TotalInvestors; index++) {
            if (WithdrawInvestment(index)) WorkDone++;
            if (
                FixStart &&
                GetPoolStatus(Investors[index].Poolid) == PoolStatus.Close
            ) {
                StartInvestor = index;
            } else {
                FixStart = false;               
            }
        }
        emit InvestorsWork(StartInvestor,WorkDone);
        return WorkDone;
    }

    function WorkForProjectOwner() internal returns (uint256) {
        uint256 WorkDone = 0;
        bool FixStart = true;
        for (uint256 index = StartProjectOwner; index < poolsCount; index++) {
            if (WithdrawLeftOvers(index)) WorkDone++;
            if (FixStart && GetPoolStatus(index) == PoolStatus.Close) {
                StartProjectOwner = index;
            } else {
                FixStart = false;               
            }
        }
        emit ProjectOwnerWork(StartProjectOwner,WorkDone);
        return WorkDone;
    }
}
