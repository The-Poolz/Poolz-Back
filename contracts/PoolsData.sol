// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./Pools.sol";

contract PoolsData is Pools {
    enum PoolStatus {Created, Open,PreMade , OutOfstock, Finished, Close} //the status of the pools

    function GetMyPoolsId() public view returns (uint256[]) {
        return poolsMap[msg.sender];
    }

    function IsReadyWithdrawLeftOvers(uint256 _PoolId)
        public
        view
        returns (bool)
    {
        return
            pools[_PoolId].FinishTime <= now && 
           pools[_PoolId].Lefttokens > 0 && 
            !pools[_PoolId].TookLeftOvers;
    }

    //@dev no use of revert to make sure the loop will work
    function WithdrawLeftOvers(uint256 _PoolId) public returns (bool) {
        //pool is finished + got left overs + did not took them
        if (IsReadyWithdrawLeftOvers(_PoolId)) {
            pools[_PoolId].TookLeftOvers = true;
            TransferToken(
                pools[_PoolId].Token,
                pools[_PoolId].Creator,
                pools[_PoolId].Lefttokens
            );
            return true;
        }
        return false;
    }

    //give the data of the pool, by id
    function GetPoolData(uint256 _id)
        public
        view
        returns (
            PoolStatus,
            address,
            uint256,
            uint256,
            address,
            uint256,
            uint256
        )
    {
        require(_id < poolsCount, "Wrong Id");
        return (
            //check if sender POZ Invester?
            GetPoolStatus(_id),
            pools[_id].Token,
            pools[_id].Rate,
            pools[_id].POZRate,
            pools[_id].Maincoin, //incase of ETH will be address.zero
            pools[_id].StartAmount,
            pools[_id].Lefttokens
        );
    }

    function GetMorePoolData(uint256 _id)
        public
        view
        returns (
            bool,
            uint256,
            uint256,
            uint256,
            address,
            bool
        )
    {
        require(_id < poolsCount, "Wrong Id");
        return (
            pools[_id].IsLocked,
            pools[_id].StartTime,
            pools[_id].FinishTime,
            pools[_id].OpenForAll,
            pools[_id].Creator,
            pools[_id].Is21DecimalRate
        );
    }

    //calculate the status of a pool
    function GetPoolStatus(uint256 _id) public view returns (PoolStatus) {
        require(_id < poolsCount, "Wrong pool id, Can't get Status");
        //Don't like the logic here - ToDo Boolean checks (truth table)
        if (now < pools[_id].StartTime) return PoolStatus.PreMade;
        if (now < pools[_id].OpenForAll && pools[_id].Lefttokens > 0) {
            //got tokens + only poz investors
            return (PoolStatus.Created);
        }
        if (
            now >= pools[_id].OpenForAll &&
            pools[_id].Lefttokens > 0 &&
            now < pools[_id].FinishTime
        ) {
            //got tokens + all investors
            return (PoolStatus.Open);
        }
        if (
            pools[_id].Lefttokens == 0 &&
            pools[_id].IsLocked &&
            now < pools[_id].FinishTime
        ) //no tokens on locked pool, got time
        {
            return (PoolStatus.OutOfstock);
        }
        if (
            pools[_id].Lefttokens == 0 && !pools[_id].IsLocked
        ) //no tokens on direct pool
        {
            return (PoolStatus.Close);
        }
        if (now >= pools[_id].FinishTime && !pools[_id].IsLocked) {
            // After finish time - not locked
            if (pools[_id].TookLeftOvers) return (PoolStatus.Close);
            return (PoolStatus.Finished);
        }
        if (
            (pools[_id].TookLeftOvers || pools[_id].Lefttokens == 0) &&
            (pools[_id].UnlockedTokens + pools[_id].Lefttokens ==
                pools[_id].StartAmount)
        ) return (PoolStatus.Close);
        return (PoolStatus.Finished);
    }
}
