// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./InvestorData.sol";

contract ThePoolz is InvestorData {
    event InvestorsWork(uint256 NewStart, uint256 TotalDone);
    event ProjectOwnerWork(uint256 NewStart, uint256 TotalDone);

    constructor() public {
        StartInvestor = 0;
        StartProjectOwner = 0;
        MinWorkInvestor = 0;
        MinWorkProjectOwner = 0;
    }

    uint256 internal MinWorkInvestor;
    uint256 internal MinWorkProjectOwner;
    uint256 internal StartInvestor;
    uint256 internal StartProjectOwner;

    function SetStartForWork(uint256 _StartInvestor, uint256 _StartProjectOwner)
        public
        onlyOwner
    {
        StartInvestor = _StartInvestor;
        StartProjectOwner = _StartProjectOwner;
    }

    function GetMinWorkInvestor() public view returns (uint256) {
        return MinWorkInvestor;
    }

    function SetMinWorkInvestor(uint256 _MinWorkInvestor) public onlyOwner {
        MinWorkInvestor = _MinWorkInvestor;
    }

    function GetMinWorkProjectOwner() public view returns (uint256) {
        return MinWorkProjectOwner;
    }

    function SetMinWorkProjectOwner(uint256 _MinWorkProjectOwner)
        public
        onlyOwner
    {
        MinWorkProjectOwner = _MinWorkProjectOwner;
    }

    //will revert if less than parameters
    function SafeWork() external returns (uint256, uint256) {
        require(CanWork(), "Need more than minimal work count");
        return DoWork();
    }

    function CanWork() public view returns (bool) {
        uint256 inv;
        uint256 pro;
        (inv, pro) = CountWork();
        return (inv > MinWorkInvestor || pro > MinWorkProjectOwner);
    }

    function DoWork() public returns (uint256, uint256) {
        uint256 pro = WorkForProjectOwner();
        uint256 inv = WorkForInvestors();
        return (inv, pro);
    }

    function CountWork() public view returns (uint256, uint256) {
        uint256 temp_investor_count = 0;
        uint256 temp_projectowner_count = 0;
        for (
            uint256 Investorindex = StartInvestor;
            Investorindex < TotalInvestors;
            Investorindex++
        ) {
            if (IsReadyWithdrawInvestment(Investorindex)) temp_investor_count++;
        }
        for (
            uint256 POindex = StartProjectOwner;
            POindex < poolsCount;
            POindex++
        ) {
            if (IsReadyWithdrawLeftOvers(POindex)) temp_projectowner_count++;
        }
        return (temp_investor_count, temp_projectowner_count);
    }

    function WorkForInvestors() internal returns (uint256) {
        uint256 WorkDone = 0;
        for (uint256 index = StartInvestor; index < TotalInvestors; index++) {
            if (WithdrawInvestment(index)) WorkDone++;
        }
        SetInvestorStart();
        emit InvestorsWork(StartInvestor, WorkDone);
        return WorkDone;
    }

    function SetInvestorStart() internal {
        for (uint256 index = StartInvestor; index < TotalInvestors; index++) {
            if (GetPoolStatus(Investors[index].Poolid) == PoolStatus.Close)
                StartInvestor = index;
            else return;
        }
    }

    function WorkForProjectOwner() internal returns (uint256) {
        uint256 WorkDone = 0;
        bool FixStart = true;
        for (uint256 index = StartProjectOwner; index < poolsCount; index++) {
            if (WithdrawLeftOvers(index)) WorkDone++;
            if (
                FixStart &&
                (pools[index].TookLeftOvers || pools[index].Lefttokens == 0)
            ) {
                StartProjectOwner = index;
            } else {
                FixStart = false;
            }
        }
        emit ProjectOwnerWork(StartProjectOwner, WorkDone);
        return WorkDone;
    }
}
