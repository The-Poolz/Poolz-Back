// SPDX-License-Identifier: MIT

pragma solidity ^0.4.24;

import "./MainCoinManager.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Pools is MainCoinManager {
    event NewPool(address token, uint256 id);
    event FinishPool(uint256 id);

    constructor() public {
        poolsCount = 0; //Start with 0
    }

    uint256 public poolsCount; // the ids of the pool
    mapping(uint256 => Pool) public pools; //the id of the pool with the data
    mapping(address => uint256[]) public poolsMap; //the address and all of the pools id's
    struct Pool {
        address Token; //the address of the erc20 toke for sale
        address Creator; //the project owner
        uint256 FinishTime; //Until what time the pool is active
        uint256 Rate; //for eth Wei, in token, by the decemal. the cost of 1 token
        uint256 POZRate; //the rate for the until OpenForAll, if the same as Rate , OpenForAll = StartTime .
        address Maincoin; // on adress.zero = ETH
        uint256 StartAmount; //The total amount of the tokens for sale
        bool IsLocked; // true - the investors getting the tokens after the FinishTime. false - intant deal
        uint256 Lefttokens; // the ammount of tokens left for sale
        uint256 StartTime; // the time the pool open //TODO Maybe Delete this?
        uint256 OpenForAll; // The Time that all investors can invest
        uint256 UnlockedTokens; //for locked pools
        bool TookLeftOvers; //The Creator took the left overs after the pool finished
    }

    function GetLastPoolId() public view returns (uint256) {
        return poolsCount;
    }

    //create a new pool
    function CreatePool(
        address _Token, //token to sell address
        uint256 _FinishTime, //Until what time the pool will work
        uint256 _Rate, //the rate of the trade
        uint256 _POZRate, //the rate for POZ Holders
        uint256 _StartAmount, //Total amount of the tokens to sell in the pool
        bool _IsLocked, //False = DSP or True = TLP
        address _MainCoin // address(0x0) = ETH, address of main token
    ) external {
        require(IsERC20(_Token), "Need Valid ERC20 Token"); //check if _Token is ERC20
        require(
            SafeMath.add(now, MinDuration) <= _FinishTime,
            "Need more then MinDuration"
        ); // check if the time is OK
        require(_MainCoin == address(0x0) || IsERC20Maincoin(_MainCoin));
        require(
            _POZRate >=_Rate ,
            "POZ holders need to have better price (or the same)"
        );
        TransferInToken(_Token, msg.sender, _StartAmount);
        uint256 Openforall = (_Rate == _POZRate)
            ? block.timestamp
            : SafeMath.add(
                SafeMath.div(
                    SafeMath.mul(
                        SafeMath.sub(_FinishTime, block.timestamp),
                        PozTimer
                    ),
                    10000
                ),
                block.timestamp
            );
        //register the pool
        pools[poolsCount] = Pool(
            _Token,
            msg.sender,
            _FinishTime,
            _Rate,
            _POZRate,
            _MainCoin,
            _StartAmount,
            _IsLocked,
            _StartAmount,
            block.timestamp,
            Openforall,
            0,
            false
        );
        poolsMap[msg.sender].push(poolsCount);
        emit NewPool(_Token, poolsCount);
        poolsCount = SafeMath.add(poolsCount,1); //joke - overflowfrom 0 on int256 = 1.16E77
    }
}
