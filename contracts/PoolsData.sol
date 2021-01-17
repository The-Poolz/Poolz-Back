// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./Pools.sol";

contract PoolsData is Pools {
    enum PoolStatus {Created, Open,PreMade , OutOfstock, Finished, Close} //the status of the pools

    function IsReadyWithdrawLeftOvers(uint256 _PoolId)
        public
        view
        returns (bool)
    {
        return
            pools[_PoolId].BaseData.FinishTime <= now && 
           pools[_PoolId].MoreData.Lefttokens > 0 && 
            !pools[_PoolId].MoreData.TookLeftOvers;
    }

    //@dev no use of revert to make sure the loop will work
    function WithdrawLeftOvers(uint256 _PoolId) public returns (bool) {
        //pool is finished + got left overs + did not took them
        if (IsReadyWithdrawLeftOvers(_PoolId)) {
            pools[_PoolId].MoreData.TookLeftOvers = true;
            TransferToken(
                pools[_PoolId].BaseData.Token,
                pools[_PoolId].BaseData.Creator,
                pools[_PoolId].MoreData.Lefttokens
            );
            return true;
        }
        return false;
    }

    //calculate the status of a pool
    function GetPoolStatus(uint256 _id) public view returns (PoolStatus) {
        require(_id < poolsCount, "Wrong pool id, Can't get Status");
        //Don't like the logic here - ToDo Boolean checks (truth table)
        if (now < pools[_id].MoreData.StartTime) return PoolStatus.PreMade;
        if (now < pools[_id].MoreData.OpenForAll && pools[_id].MoreData.Lefttokens > 0) {
            //got tokens + only poz investors
            return (PoolStatus.Created);
        }
        if (
            now >= pools[_id].MoreData.OpenForAll &&
            pools[_id].MoreData.Lefttokens > 0 &&
            now < pools[_id].BaseData.FinishTime
        ) {
            //got tokens + all investors
            return (PoolStatus.Open);
        }
        if (
            pools[_id].MoreData.Lefttokens == 0 &&
            pools[_id].MoreData.IsLocked &&
            now < pools[_id].BaseData.FinishTime
        ) //no tokens on locked pool, got time
        {
            return (PoolStatus.OutOfstock);
        }
        if (
            pools[_id].MoreData.Lefttokens == 0 && !pools[_id].MoreData.IsLocked
        ) //no tokens on direct pool
        {
            return (PoolStatus.Close);
        }
        if (now >= pools[_id].BaseData.FinishTime && !pools[_id].MoreData.IsLocked) {
            // After finish time - not locked
            if (pools[_id].MoreData.TookLeftOvers) return (PoolStatus.Close);
            return (PoolStatus.Finished);
        }
        if (
            (pools[_id].MoreData.TookLeftOvers || pools[_id].MoreData.Lefttokens == 0) &&
            (pools[_id].MoreData.UnlockedTokens + pools[_id].MoreData.Lefttokens ==
                pools[_id].BaseData.StartAmount)
        ) return (PoolStatus.Close);
        return (PoolStatus.Finished);
    }
}
