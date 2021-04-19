// SPDX-License-Identifier: MIT

pragma solidity ^0.6.0;

import "./Manageable.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Pools is Manageable {
    event NewPool(address token, uint256 id);
    event FinishPool(uint256 id);
    event PoolUpdate(uint256 id);

    constructor() public {
        //  poolsCount = 0; //Start with 0
    }

    uint256 public poolsCount; // the ids of the pool
    mapping(uint256 => Pool) pools; //the id of the pool with the data
    mapping(address => uint256[]) poolsMap; //the address and all of the pools id's
    struct Pool {
        PoolBaseData BaseData;
        PoolMoreData MoreData;
    }
    struct PoolBaseData {
        address Token; //the address of the erc20 toke for sale
        address Creator; //the project owner
        uint256 FinishTime; //Until what time the pool is active
        uint256 Rate; //for eth Wei, in token, by the decemal. the cost of 1 token
        uint256 POZRate; //the rate for the until OpenForAll, if the same as Rate , OpenForAll = StartTime .
        address Maincoin; // on adress.zero = ETH
        uint256 StartAmount; //The total amount of the tokens for sale
    }
    struct PoolMoreData {
        uint64 LockedUntil; // true - the investors getting the tokens after the FinishTime. false - intant deal
        uint256 Lefttokens; // the ammount of tokens left for sale
        uint256 StartTime; // the time the pool open //TODO Maybe Delete this?
        uint256 OpenForAll; // The Time that all investors can invest
        uint256 UnlockedTokens; //for locked pools
        uint256 WhiteListId; // 0 is turn off, the Id of the whitelist from the contract.
        bool TookLeftOvers; //The Creator took the left overs after the pool finished
        bool Is21DecimalRate; //If true, the rate will be rate*10^-21
    }

    function isPoolLocked(uint256 _id) public view returns(bool){
        return pools[_id].MoreData.LockedUntil > now;
    }

    //create a new pool
    function CreatePool(
        address _Token, //token to sell address
        uint256 _FinishTime, //Until what time the pool will work
        uint256 _Rate, //the rate of the trade
        uint256 _POZRate, //the rate for POZ Holders, how much each token = main coin
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        uint64 _LockedUntil, //False = DSP or True = TLP
        address _MainCoin, // address(0x0) = ETH, address of main token
        bool _Is21Decimal, //focus the for smaller tokens.
        uint256 _Now, //Start Time - can be 0 to not change current flow
        uint256 _WhiteListId // the Id of the Whitelist contract, 0 For turn-off
    ) public payable whenNotPaused {
        require(msg.value >= PoolPrice, "Need to pay for the pool");
        require(IsValidToken(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        require(
            _MainCoin == address(0x0) || IsERC20Maincoin(_MainCoin),
            "Main coin not in list"
        );
        require(_FinishTime  < SafeMath.add(MaxDuration, now), "Pool duration can't be that long");
        require(_LockedUntil < SafeMath.add(MaxDuration, now) , "Locked value can't be that long");
        require(
            _Rate <= _POZRate,
            "POZ holders need to have better price (or the same)"
        );
        require(_POZRate > 0, "It will not work");
        if (_Now < now) _Now = now;
        require(
            SafeMath.add(now, MinDuration) <= _FinishTime,
            "Need more then MinDuration"
        ); // check if the time is OK
        TransferInToken(_Token, msg.sender, _StartAmount);
        uint256 Openforall =
            (_WhiteListId == 0) 
                ? _Now //and this
                : SafeMath.add(
                    SafeMath.div(
                        SafeMath.mul(SafeMath.sub(_FinishTime, _Now), PozTimer),
                        10000
                    ),
                    _Now
                );
        //register the pool
        pools[poolsCount] = Pool(
            PoolBaseData(
                _Token,
                msg.sender,
                _FinishTime,
                _Rate,
                _POZRate,
                _MainCoin,
                _StartAmount
            ),
            PoolMoreData(
                _LockedUntil,
                _StartAmount,
                _Now,
                Openforall,
                0,
                _WhiteListId,
                false,
                _Is21Decimal
            )
        );
        poolsMap[msg.sender].push(poolsCount);
        emit NewPool(_Token, poolsCount);
        poolsCount = SafeMath.add(poolsCount, 1); //joke - overflowfrom 0 on int256 = 1.16E77
    }
}
