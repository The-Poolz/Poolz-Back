// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

import "./PoolsData.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Invest is PoolsData {
    event NewInvestorEvent(uint256 Investor_ID, address Investor_Address);

    modifier CheckTime(uint256 _Time) {
        require(now >= _Time, "Pool not open yet");
        _;
    }

    //using SafeMath for uint256;
    constructor() public {
        TotalInvestors = 0;
    }

    //Investorsr Data
    uint256 internal TotalInvestors;
    mapping(uint256 => Investor) Investors;
    mapping(address => uint256[]) InvestorsMap;
    struct Investor {
        uint256 Poolid; //the id of the pool, he got the rate info and the token, check if looked pool
        address InvestorAddress; //
        uint256 MainCoin; //the amount of the main coin invested (eth/dai), calc with rate
        bool IsPozInvestor; //If the blance of the address got > MinPoz, can get discout if got early
        uint256 TokensOwn; //the amount of Tokens the investor needto get from the contract
        uint256 InvestTime; //the time that investment made
    }

    //@dev Send in wei
    function InvestETH(uint256 _PoolId)
        external
        payable
        ReceivETH(msg.value, msg.sender,MinETHInvest)
        whenNotPaused
        CheckTime(pools[_PoolId].StartTime)
    {
        require(_PoolId < poolsCount, "Wrong pool id, InvestETH fail");
        require(pools[_PoolId].Maincoin == address(0x0), "Pool is not for ETH");
        require(msg.value >= MinETHInvest && msg.value <= MaxETHInvest, "Investment amount not valid");
        require(msg.sender == tx.origin && !isContract(msg.sender), "Some thing wrong with the msgSender");
        uint256 ThisInvestor = NewInvestor(msg.sender, msg.value, _PoolId);
        uint256 Tokens = CalcTokens(_PoolId, msg.value, msg.sender);
        if (pools[_PoolId].IsLocked) {
            Investors[ThisInvestor].TokensOwn = SafeMath.add(
                Investors[ThisInvestor].TokensOwn,
                Tokens
            );
        } else {
            // not locked, will transfer the toke
            TransferToken(pools[_PoolId].Token, msg.sender, Tokens);
        }

        uint256 EthMinusFee = SafeMath.div(
            SafeMath.mul(msg.value, SafeMath.sub(10000, CalcFee(_PoolId))),
            10000
        );

        TransferETH(pools[_PoolId].Creator, EthMinusFee); // send money to project owner - the fee stays on contract
        RegisterInvest(_PoolId, Tokens);
    }

    function InvestERC20(uint256 _PoolId, uint256 _Amount)
        external
        whenNotPaused
        CheckTime(pools[_PoolId].StartTime)
    {
        require(_PoolId < poolsCount, "Wrong pool id, InvestERC20 fail");
        require(
            pools[_PoolId].Maincoin != address(0x0),
            "Pool is for ETH, use InvetETH"
        );
        require(_Amount > 10000, "Need invest more then 10000");
        require(msg.sender == tx.origin && !isContract(msg.sender), "Some thing wrong with the msgSender");
        TransferInToken(pools[_PoolId].Maincoin, msg.sender, _Amount);
        uint256 ThisInvestor = NewInvestor(msg.sender, _Amount, _PoolId);
        uint256 Tokens = CalcTokens(_PoolId, _Amount, msg.sender);

        if (pools[_PoolId].IsLocked) {
            Investors[ThisInvestor].TokensOwn = SafeMath.add(
                Investors[ThisInvestor].TokensOwn,
                Tokens
            );
        } else {
            // not locked, will transfer the tokens
            TransferToken(pools[_PoolId].Token, msg.sender, Tokens);
        }

        uint256 RegularFeePay = SafeMath.div(
            SafeMath.mul(_Amount, CalcFee(_PoolId)),
            10000
        );

        uint256 RegularPaymentMinusFee = SafeMath.sub(_Amount, RegularFeePay);
        FeeMap[pools[_PoolId].Maincoin] = SafeMath.add(
            FeeMap[pools[_PoolId].Maincoin],
            RegularFeePay
        );
        TransferToken(
            pools[_PoolId].Maincoin,
            pools[_PoolId].Creator,
            RegularPaymentMinusFee
        ); // send money to project owner - the fee stays on contract
        RegisterInvest(_PoolId, Tokens);
    }

    function RegisterInvest(uint256 _PoolId, uint256 _Tokens) internal {
        require(
            _Tokens <= pools[_PoolId].Lefttokens,
            "Not enough tokens in the pool"
        );
        pools[_PoolId].Lefttokens = SafeMath.sub(
            pools[_PoolId].Lefttokens,
            _Tokens
        );
        if (pools[_PoolId].Lefttokens == 0) emit FinishPool(_PoolId);
        else emit PoolUpdate(_PoolId);
    }

    function NewInvestor(
        address _Sender,
        uint256 _Amount,
        uint256 _Pid
    ) internal returns (uint256) {
        Investors[TotalInvestors] = Investor(
            _Pid,
            _Sender,
            _Amount,
            IsPOZInvestor(_Sender),
            0,
            block.timestamp
        );
        InvestorsMap[msg.sender].push(TotalInvestors);
        emit NewInvestorEvent(TotalInvestors,_Sender);
        TotalInvestors = SafeMath.add(TotalInvestors, 1);
        return SafeMath.sub(TotalInvestors, 1);
    }

    function CalcTokens(
        uint256 _Pid,
        uint256 _Amount,
        address _Sender
    ) internal view returns (uint256) {
        uint256 msgValue = _Amount;
        uint256 result = 0;
        if (GetPoolStatus(_Pid) == PoolStatus.Created) {
            if (!IsPOZInvestor(_Sender)) {
                revert("Need to be POZ Holder to invest");
            }
            result = SafeMath.mul(msgValue, pools[_Pid].POZRate);
        }
        if (GetPoolStatus(_Pid) == PoolStatus.Open) {
            result = SafeMath.mul(msgValue, pools[_Pid].Rate);
        }
        if (result > 10**21) {
            if (pools[_Pid].Is21DecimalRate) {
                result = SafeMath.div(result, 10**21);
            }
            return result;
        }
        revert("Wrong pool status to CalcTokens");
    }

    function CalcFee(uint256 _Pid) internal view returns (uint256) {
        if (GetPoolStatus(_Pid) == PoolStatus.Created) {
            return PozFee;
        }
        if (GetPoolStatus(_Pid) == PoolStatus.Open) {
            return Fee;
        }
        //will not get here, will fail on CalcTokens
        //revert("Wrong pool status to CalcFee");
    }

       //@dev use it with  require(msg.sender == tx.origin)
    function isContract(address _addr) internal view returns (bool) {      
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }
}
